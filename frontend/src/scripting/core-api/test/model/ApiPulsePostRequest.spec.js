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
    instance = new MetabaseApi.ApiPulsePostRequest();
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

  describe('ApiPulsePostRequest', function() {
    it('should create an instance of ApiPulsePostRequest', function() {
      // uncomment below and update the code to test ApiPulsePostRequest
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be.a(MetabaseApi.ApiPulsePostRequest);
    });

    it('should have the property cards (base name: "cards")', function() {
      // uncomment below and update the code to test the property cards
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property channels (base name: "channels")', function() {
      // uncomment below and update the code to test the property channels
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property collectionId (base name: "collection_id")', function() {
      // uncomment below and update the code to test the property collectionId
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property collectionPosition (base name: "collection_position")', function() {
      // uncomment below and update the code to test the property collectionPosition
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property dashboardId (base name: "dashboard_id")', function() {
      // uncomment below and update the code to test the property dashboardId
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property name (base name: "name")', function() {
      // uncomment below and update the code to test the property name
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property parameters (base name: "parameters")', function() {
      // uncomment below and update the code to test the property parameters
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

    it('should have the property skipIfEmpty (base name: "skip_if_empty")', function() {
      // uncomment below and update the code to test the property skipIfEmpty
      //var instance = new MetabaseApi.ApiPulsePostRequest();
      //expect(instance).to.be();
    });

  });

}));
