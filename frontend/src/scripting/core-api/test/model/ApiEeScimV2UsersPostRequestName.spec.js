/**
 * Metabase API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1.53.2-SNAPSHOT
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', process.cwd()+'/src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require(process.cwd()+'/src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.MetabaseApi);
  }
}(this, function(expect, MetabaseApi) {
  'use strict';

  var instance;

  beforeEach(function() {
    instance = new MetabaseApi.ApiEeScimV2UsersPostRequestName();
  });

  var getProperty = function(object, getter, property) {
    // Use getter method if present; otherwise, get the property directly.
    if (typeof object[getter] === 'function')
      return object[getter]();
    else
      return object[property];
  }

  var setProperty = function(object, setter, property, value) {
    // Use setter method if present; otherwise, set the property directly.
    if (typeof object[setter] === 'function')
      object[setter](value);
    else
      object[property] = value;
  }

  describe('ApiEeScimV2UsersPostRequestName', function() {
    it('should create an instance of ApiEeScimV2UsersPostRequestName', function() {
      // uncomment below and update the code to test ApiEeScimV2UsersPostRequestName
      //var instance = new MetabaseApi.ApiEeScimV2UsersPostRequestName();
      //expect(instance).to.be.a(MetabaseApi.ApiEeScimV2UsersPostRequestName);
    });

    it('should have the property familyName (base name: "familyName")', function() {
      // uncomment below and update the code to test the property familyName
      //var instance = new MetabaseApi.ApiEeScimV2UsersPostRequestName();
      //expect(instance).to.be();
    });

    it('should have the property givenName (base name: "givenName")', function() {
      // uncomment below and update the code to test the property givenName
      //var instance = new MetabaseApi.ApiEeScimV2UsersPostRequestName();
      //expect(instance).to.be();
    });

  });

}));
