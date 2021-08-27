# oBundle BigCommerce - Stencil Test

## Preview Code

a06fcyfhwa

## URL

https://obundletest5.mybigcommerce.com/

### Steps Taken

Having never worked with stencil or Big Commerce, I took a lot of time reading through the docs, this took
about a day for it to start to sink in.

I decided to create a custom pages directory and added my custom category named simpleItemCategory to the
config.stencil.json. Creating this was necessary to avoid my changes effecting all other categories.

I created two buttons above the product grid and below the category header, this seemed like a logical place to
position them. I conditionally hid the removeAll button if the cart array was empty.

I created a product through the big commerce control panel and added 3 images with a description and other attributes.

I decided to built all my funcionality within the category.js file, this would be accessable by my new simpleItemCategory.html
and considering the time restrictions, allowed me the greatest chance of completion.

I used jquery to access my two buttons from the DOM and registerd onClick handlers for both.

I created functions called cartRemoveItem, createCart, getCart, and addToCart

cartRemoveItem uses the storefront API and is called when removeAll button is clicked. It uses fetch to send a DELETE http request using the cartId as a parameter and deletes the entire cart. It then registers a pop up and displays success.

createCart sends a post request to the storefront API /carts to
create a new cart and return the new cartId.
