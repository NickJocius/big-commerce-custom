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
        this.cartId = this.context ? this.context.cartId : null;
        this.productId = this.context;
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
        console.log(this.productId);
        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        // event handler for addAll button
        $('button#addAll').on('click', (e) => {
            e.preventDefault();
            console.log(this.cartId);
            let id = parseInt(document.getElementById('addAll').value);
            this.addToCart(this.productId, this.cartId);
        });

        $('button#removeAll').on('click', (e) => {
            e.preventDefault();
            let newCartId = document.getElementById('removeAll').value;
            this.cartRemoveItem(newCartId);
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

    cartRemoveItem(cartId) {
        let url = `${secureBaseUrl}/carts/${cartId}`;
        
        fetch(url, {
            method: "DELETE",
            credentials: "include",
        }).then(response => response.json())
            .then(() => {
                swal.fire({
                    text: 'Items Removed',
                    icon: 'success',
                });
            }).catch(errors => {
                console.log(errors);
        })
    }

    addToCart(productId,cartId) {
        let url = cartId ? `/api/storefront/carts/${cartId}/items` : `/api/storefront/carts`;
        let data = {
            lineItems: [{
                quantity: 1,
                productId: productId
            }
            ]
        }
        let options = {
            method: 'POST',
            body: JSON.stringify(data),
            credentials: 'include',
            headers: {
                "Content-type": "application/json"
            }
        }
        return fetch(url, options)
            .then(response => response.json())
            .then(function(jdata) {
                this.cartId = jdata.data;
                console.log(cartId);
            })
            .catch(err => console.log(err));
    }
    
    getCart(secureBaseUrl, newCartId) {
        fetch('http://localhost:3000/carts', {
            credentials: 'include'
        }).then(function (response) {
            return response.json();
        }).then(function (myjson) {
            console.log(myjson);
            cartPreview(secureBaseUrl, newCartId);
        })
        
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
