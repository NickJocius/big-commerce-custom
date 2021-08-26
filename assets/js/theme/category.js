import  utils  from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
import cartPreview from './global/cart-preview';
import swal from './global/sweet-alert';
const { hooks } = utils;

export default class Category extends CatalogPage {
    constructor(context) {
        super(context);
        this.validationDictionary = createTranslationDictionary(context);
    }


    setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
        $element.attr({
            role: roleType,
            'aria-live': ariaLiveStatus,
        });
    }

    makeShopByPriceFilterAccessible() {
        if (!$('[data-shop-by-price]').length) return;

        if ($('.navList-action').hasClass('is-active')) {
            $('a.navList-action.is-active').focus();
        }

        $('a.navList-action').on('click', () => this.setLiveRegionAttributes($('span.price-filter-message'), 'status', 'assertive'));
    }

    onReady() {
       
        this.arrangeFocusOnSortBy();

        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        $('button#addAll').on('click', (e) => {
            e.preventDefault();
            let id = parseInt(document.getElementById('addAll').value);

            let url = `http://localhost:3000/cart.php?action=add&product_id=${id}`;
            this.createCart(url, {
                "lineItems": [
                    {
                        
                        "productId": id
                    }
                ]
            })
            .then(data => console.log(JSON.stringify(data)))
            .catch(error => console.error(error));
            this.addToCart();
        });

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
    }

    cartRemoveItem(itemId,secureBaseUrl) {
        
        utils.api.cart.itemRemove(itemId, (err, response) => {
            if (response.data.status === 'succeed') {
                cartPreview(secureBaseUrl);
                swal.fire({
                    text: 'Items Removed',
                    icon: 'error',
                });
            } else {
                swal.fire({
                    text: response.data.errors.join('\n'),
                    icon: 'error',
                });
            }
        });
    }

    createCart(url, cartItems,secureBaseUrl) {
        
        return fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cartItems),
        }).then(response => response.json())
            .then(this.getCart(secureBaseUrl),
                swal.fire({
                    text: 'Items Added',
                    icon: 'success',
                })
        ).catch((errors) => {
            swal.fire({
                text: response.data.errors.join('\n'),
                icon: 'error',
            });
        });
    }

    addToCart() {
        
        if (utils.tools.storage.localStorageAvailable()) {
            if (localStorage.getItem('cart-quantity')) {
                let quantity = Number(localStorage.getItem('cart-quantity'));
                localStorage.setItem('cart-quantity', ++quantity);
            }
        }
    }
    
    getCart(secureBaseUrl) {
        fetch('http://localhost:3000/api/storefront/carts', {
            credentials: 'include'
        }).then(function (response) {
            return response.json();
        }).then(function (myjson) {
            console.log(myjson);
            cartPreview(secureBaseUrl, myjson[0].id);
        });
        
    }

    ariaNotifyNoProducts() {
        const $noProductsMessage = $('[data-no-products-notification]');
        if ($noProductsMessage.length) {
            $noProductsMessage.focus();
        }
    }

    initFacetedSearch() {
        const {
            price_min_evaluation: onMinPriceError,
            price_max_evaluation: onMaxPriceError,
            price_min_not_entered: minPriceNotEntered,
            price_max_not_entered: maxPriceNotEntered,
            price_invalid_value: onInvalidPrice,
        } = this.validationDictionary;
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('body').triggerHandler('compareReset');

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        }, {
            validationErrorMessages: {
                onMinPriceError,
                onMaxPriceError,
                minPriceNotEntered,
                maxPriceNotEntered,
                onInvalidPrice,
            },
        });
    }
}
