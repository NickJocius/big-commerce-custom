# oBundle BigCommerce - Stencil Test

## Preview Code

a06fcyfhwa

## URL

https://obundletest5.mybigcommerce.com/

## GitHub repo

https://github.com/NickJocius/oBundleTest

## Customer Login

To use sign in
email: capacity512@yahoo.com
pw: abcd1234

### Steps Taken

All changes are made in simpleItemCategory.html, category.html and category.js after bringing in the template into my local enviornment.

1. added custom catergory page named simpleItemCategory
2. mapped custom page on config.stencil.json
3. created product from storefront control panel
4. created category from storefront control panel and added custom template
5. decided to use category.js to add custom javascript
6. imported swal to use as alert pop up for user triggered events
7. declared variables cartId, secureBaseUrl, and cartUrl from context
8. created addAllToCart function:
   > > This function takes base url, cart url and product Id as arguments.
   > > it add item to cart or creates and add product to new cart if one doesn't exist.
   > > It makes an http post request using the add to cart url, the sweet alert is triggerd on success or failure.
9. created removeAll function:
   > > This function takes the cart id as parameter and makes a DELETE request to the delete cart endpoint. The sweet alert is used for notifying of error or success.
10. I created a form on the html page when submited created form data with the product id. The form data is passed to the request and the page is reloaded to update the navbar cart quantity.
11. I added a remove all button which triggers the removeAll function on click event. The page is then reloaded to update cart quantity.
12. I used in-line styling to style the new html elements.
13. I created an element above the added form and buttons that displays the customers id, name, email and phone.
    > > This required creating an app to gain access to the clientId and inserting a script into the simpleItemCategory.html. The script makes and XMLhttp request.
14. I created a series of functions to change image on hover.
    > > I used jquery to access the card-image and created two empty arrays to add images to. Then as I looped over the image array I changed the size variables to not revieve error then added on mouseover event to change to second image and on mouseout changed back to original image.

## Test Notes

Having never worked with BigCommerce or stencil, this test required a significant amount of time dedicated to study and research. I had some exposure to handlebars during my degree and needed a refresher. Given how much I have learned about using this platform in only 4 days, I am confident with a little more time I could fully grasp all concepts and maintain a strict adherence to it's structure and patterns. This test has only made me more curious and determined to master the platform and I will continue to learn its concepts regardless of any outcome.
