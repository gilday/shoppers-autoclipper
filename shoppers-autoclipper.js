// shoppers-autoclipper.js CasperJS script

const casper = require('casper').create({
    logLevel: 'debug',
    verbose: true
})

const username = casper.cli.get('username')
const password = casper.cli.get('password')

casper.start('https://www.shoppersfood.com/savings/coupons.html', function start () {
  casper.viewport(1920, 1080) // viewport must be larger than default accommodate the responsive design
  if (!(username && password)) {
    this.echo('username and password required')
    this.exit(1)
  }
})

// LOGIN
casper.then(function onPageReady () {
  this.evaluate(function login (username, password) {
    $.post('https://www.shoppersfood.com/services/login', {
      j_username: username,
      j_password: password,
      rememberMe: false,
      banner_id: 12
    }).then(function reload () { window.location.reload() })
  }, username, password)
}, onTimeout('login'))
casper.wait(20000) // TODO how to tell when login complete

// CLIP
casper.waitWhileVisible('.coupon-spinner', function onCouponsLoaded () {
  casper.capture('screenshots/04-coupons-loaded.jpg')
  this.evaluate(function () {
    function clip (id) {
      return $.post('/services/newcoupons', {
        'couponId': coupon.id
      })
    }
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
  casper.capture('screenshots/05-coupons-clipped.jpg')
  this.echo('clipped all coupons')
}, onTimeout('clipping coupons timeout'), 360000)

casper.run()

function onTimeout (msg) {
  if (!msg) {
    msg = 'timeout waiting for page to load'
  }
  return function () {
    this.echo(this.getHTML('.ss-container'))
    casper.capture('screenshots/06-timeout.jpg')
    this.echo(msg).exit(1)
  }
}
