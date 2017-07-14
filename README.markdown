# shoppers-autoclipper

Script for automatically clipping [Shoppers](https://shoppersfood.com) coupons.
Run this script on a schedule to help your grocery bill with little effort. In
no way affiliated with Shoppers.

Before running this script, make sure to sign-up for a Shoppers online account
and enter a reward number.

The script uses [CasperJS](http://casperjs.org/) to execute the
`shoppers-autoclipper.js` script in a PhantomJS browser. The script navigates to
harristeeter.com,  performs a log-in, then clips all available coupons.


## Run with Docker

The recommended way to run shoppers-autoclipper is with Docker

    docker run --rm gilday/shoppers-autoclipper --username=<shoppers-username> --password=<shoppers-password>
