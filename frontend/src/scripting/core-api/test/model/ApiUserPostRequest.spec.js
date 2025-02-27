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
    instance = new MetabaseApi.ApiUserPostRequest();
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

  describe('ApiUserPostRequest', function() {
    it('should create an instance of ApiUserPostRequest', function() {
      // uncomment below and update the code to test ApiUserPostRequest
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be.a(MetabaseApi.ApiUserPostRequest);
    });

    it('should have the property email (base name: "email")', function() {
      // uncomment below and update the code to test the property email
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be();
    });

    it('should have the property firstName (base name: "first_name")', function() {
      // uncomment below and update the code to test the property firstName
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be();
    });

    it('should have the property lastName (base name: "last_name")', function() {
      // uncomment below and update the code to test the property lastName
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be();
    });

    it('should have the property loginAttributes (base name: "login_attributes")', function() {
      // uncomment below and update the code to test the property loginAttributes
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be();
    });

    it('should have the property userGroupMemberships (base name: "user_group_memberships")', function() {
      // uncomment below and update the code to test the property userGroupMemberships
      //var instance = new MetabaseApi.ApiUserPostRequest();
      //expect(instance).to.be();
    });

  });

}));
