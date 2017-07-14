// shoppers-autoclipper.js CasperJS script

const casper = require('casper').create()

const username = casper.cli.get('username')
const password = casper.cli.get('password')

casper.start('https://www.shoppersfood.com/savings/coupons.html', function () {
  casper.viewport(1440, 1080) // viewport must be larger than default accommodate the responsive design
  if (!(username && password)) {
    this.echo('username and password required')
    this.exit(1)
  }
})

// OPEN LOGIN FORM
casper.then(function () {
  this.evaluate(function openLoginForm () {
    SimpleSignup.app = new SimpleSignup.Signin()
    SimpleSignup.app.init()
  })
})

// FILL USERNAME AND PASSWORD
casper.waitUntilVisible('#ss-login-form')
casper.wait(8000, function () {
  this.fillSelectors('#ss-login-form', {
    '#ss-email-input': username,
    '#ss-password-login': password
  }, false)
  this.evaluate(function clickLogin () {
    $('button.ss-login-btn').click()
  })
})
casper.waitWhileVisible('#ss-login-form', function () {
}, onTimeout('login timeout'), 60000)

// CLIP
casper.waitWhileVisible('.content .coupon-loading', function () {
  this.evaluate(function () {
    var clip = SVUMaster.couponAddToCard
    function getUnclippedCouponIDs () {
      // requesting page number 0 returns all coupons in a single page
      return $.getJSON('https://www.shoppersfood.com/services/couponlist?category=All&currentPageNumber=0').then(function (data) {
        return data.coupons
          .filter(function (c) { return !c.onCard })
          .map(function (c) { return c.id })
      })
    }
    function clipAll () {
      return getUnclippedCouponIDs().then(function (ids) {
        const queue = ids.map(function (id) { return clip.bind(null, id) })
        return queue.reduce(function (prev, cur) { return prev.then(cur) }, $.Deferred().resolve())
      })
    }
    clipAll().then(function () {
      // append marker element to the DOM
      $(document.body).append('<div id="shoppers-autoclip-complete-marker"></div>')
    })
  })
}, onTimeout('loading coupons timeout'), 20000)

casper.waitForSelector('#shoppers-autoclip-complete-marker', function () {
  this.echo('clipped all coupons')
}, onTimeout('clipping coupons timeout'), 300000)

casper.run()

function onTimeout (msg) {
  if (msg == null) {
    msg = 'timeout waiting for page to load'
  }
  return function () {
    this.echo(msg).exit(1)
  }
}
