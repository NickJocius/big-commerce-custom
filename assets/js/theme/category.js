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
        // get card image from dom
        console.log(this.context);

        let cartId = this.context.cartId;
        const secureBaseUrl = this.context.secureBaseUrl;
        const cartUrl = this.context.urls.cart;
        // set variable as function to use in jquery
        let addAll = this.addAllToCart;
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
        })
        // button removeAll click event handler
        $('#removeAll').on('click', function (event) {
            event.preventDefault();

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
            credentials: 'include'
        }).then(function (res) {
            if (res.status == 'ok') {
                return res.json();
            }
        })
            .then(data => console.log(data))
            .catch(err => console.log(err));
    }
    // remove all from cart function
    removeAll(cartId) {
        console.log(this.context);
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
