const { ComponentClass } = require('../../server/component-helper.js')
// You might need ComponentHelper also.
// const { ComponentClass, ComponentHelper } = require('../../server/component-helper.js')

/**
 * Extended class to be exported as `Component`
 *
 * @class
 * @external ComponentClass
 * @exports Anonymousclass
 */
module.exports = class extends ComponentClass {
  /**
   * This callback will be called when this component object is constructed and loaded into server.
   *
   * @description Usually, a good position to initialize internal values.
   * `this.config` and `this.elements` are fulfilled already from `./config.js`
   * And some basic read-only properties `this.id`, `this.name`, `this.dir`, `this.url` are defined.
   *
   * @returns null
   */
  onConstructed () {
    // code
  }

  /**
   * This callback will be called each time when a client is connected and ready.
   *
   * @description If you need client-specific job, you can start here.
   * @param {string} clientId - client id (e.g: `default_123456789`)
   * @returns {Promise} `resolve()` or `reject(reason)`
   */
  onClientReady (clientId) {
    return new Promise((resolve, reject) => {
      // code
      resolve()
    })
  }

  /**
   * Message from the client (client scripts or custom elements)
   *
   * @param {object} - Message object
   * @returns {anything | null} return value will be returned to sender of message automatically.
   */
  onClientMessage (message) {
    console.log(message)
    console.log(`Component ${this.id} is received message from client.`)
    return 'SUCCESS'
  }

  /**
   * This callback will be called when all server assets are loaded and prepared.
   *
   * @description Usually, a good position to start serverside works.
   * @returns null
   */
  onReady () {
    // code
  }

  /**
   * This callback will be called when HTTP Request is comming to this component.
   *
   * @description By default, `/COMPONENT_ID` URL is opened for getting HTTP Request from outside.
   * Usable to make mini web service or REST API service of this component.
   * @param {object} req - Express.request
   * @param {object} res - Express.response
   * @returns null
   * @example
   * onRequested (req, res) {
   *    res.status(404).send('No response.')
   * }
   */
  onRequested (req, res) {
    res.status(404).send('No response.')
  }

  /**
   * Inject Internal/External javascript to client document
   *
   * @description When you need `<script src=...>` in document of client.
   * Tbis method will be ignored if the user might override `_scripts: []` in `./config.js`
   *
   * @returns {array} Array of URL
   * @example
   * return [
   * '/THISCOMPONENT/public/some.js',
   * 'https://somewhere/some.js'
   * ]
   */
  injectScripts () {
    return []
  }

  /**
   * Inject Internal/External CSS Stylesheet to client document
   *
   * @description When you need `<link type="text/css" ...>` in document of client.
   * Tbis method will be ignored if the user might override `_styles: []` in `./config.js`
   *
   * @returns {array} Array of URL
   * @example
   * return [
   * '/THISCOMPONENT/public/some.css',
   * 'https://somewhere/some.css'
   * ]
   */
  injectStyles () {
    return []
  }

  /**
   * Inject Internal/External Module script(ES2015, mjs) to client document.
   *
   * @description When you need `import ...` in document of client.
   * imported module will be attached to the global `window.MZ` object.
   * So you can use that imported module in anywhere of client. (Usually in `customElement`)
   * Tbis method will be ignored if the user might override `_moduleScripts: []` in `./config.js`
   *
   * @returns {array} Array of URL
   * @example
   * return [
   * '/THISCOMPONENT/public/some.mjs',
   * 'https://somewhere/some.mjs'
   * ]
   */
  injectModuleScripts () {
    return []
  }

  /**
   * Add static routes to express webserver.
   *
   * @returns {array} array of string(route) or array of object(route, path)
   * @example
   * return [
   *   'resource', // /COMPONENT_ID/resource will be served as http://localhost:8080/COMPONENT_ID/resource
   *   {
   *      'path': 'some/path/to' // /COMPONENT_ID/some/path/to will be served as;
   *      'route': '/images', // http://localhost:8080/images
   *   }
   * ]
   *
   */
  getStaticRoutes () {
    return []
  }
}
