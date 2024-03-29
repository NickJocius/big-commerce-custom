import  utils  from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import compareProducts from './global/compare-products';
import FacetedSearch from './common/faceted-search';
import { createTranslationDictionary } from '../theme/common/utils/translations-utils';
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
        // get card image from dom
        console.log(this.context);
        let cartId = this.context.cartId;
        const secureBaseUrl = this.context.secureBaseUrl;
        const cartUrl = this.context.urls.cart;
        let catProds = this.context.categoryProducts;
        let prodImg = this.context.categoryProducts[0].image;
        console.log(prodImg);
        // set variable as function to use in jquery
        let addAll = this.addAllToCart;
        let remAll = this.removeAll;
        // define function
        function addCartTriggered(url, cUrl, pId) {
            addAll(url, cUrl, pId);
        }
        // use form data to hit cart api on submit on submit event
        $('#cartForm').on('submit', function (event) {
            event.preventDefault();
            const formData = new URLSearchParams(new FormData(this));
            console.log(formData.get('productId'));
            let pId = formData.get('productId');

            addCartTriggered(secureBaseUrl, cartUrl, pId);
            setTimeout(location.reload.bind(location), 3000);
        })
        // button removeAll click event handler
        $('#removeAll').on('click', function (event) {
            event.preventDefault();
            remAll(cartId);
            setTimeout(location.reload.bind(location), 3000);
        })
        // set two empty arrays to hold current image and next image
        var mainImages = [];
        var rollOvers = [];
        // add images to arrays
        catProds.forEach(function(e, i) {
            if (e.image.data) {
            mainImages[0] = e.image.data;
            }
            if (e.images[0]) {
            rollOvers[0] = e.images[0].data;
            }
        });
        // need to change variables or error will occur
        rollOvers.forEach(function (image, id) {
            image = image.replace('{:size}', '500x659');
            $('.card-image').on(" mouseover", function () {
                $(this).attr('srcset', image);
 
            }).on('mouseout', function () {
                    $(this).attr('srcset', mainImages[0].replace('{:size}', '500x659'));
                 })
        })


        $('[data-button-type="add-cart"]').on('click', (e) => this.setLiveRegionAttributes($(e.currentTarget).next(), 'status', 'polite'));

        this.makeShopByPriceFilterAccessible();

        compareProducts(this.context);

        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }

        $('a.reset-btn').on('click', () => this.setLiveRegionsAttributes($('span.reset-message'), 'status', 'polite'));

        this.ariaNotifyNoProducts();
    }

    // add all items function
    addAllToCart( url, cartUrl,productId) {
        return fetch(`${url}${cartUrl}?action=add&product_id=${productId}`, {
            credentials: 'include',
        }).then(function (response) {
            if (response.status == 'ok') {
                return response.json();
            } else {
                swal.fire({
                    text: 'Error Adding',
                    icon: 'error',
                });
            }
        })
            .then(function (res) {
                console.log(res);
                swal.fire({
                    text: 'Added All Items',
                    icon: 'success',
                });
            })
            .catch(err => console.log(err));
    }
    // remove all from cart function
    removeAll( cartId) {
        return fetch(`/api/storefront/carts/${cartId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            }
        }).then(function (response) {
            if (response == 'ok') {
                return response.json();
            } else {
                swal.fire({
                    text: 'Error Removing',
                    icon: 'error',
                });
            }
        }).then(function (res) {
            console.log(res);
            swal.fire({
                text: 'Removed All Items',
                icon: 'success',
            });
          })
            .catch(err => console.log(err));
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
