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
    instance = new MetabaseApi.ApiDatabaseIdPutRequest();
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

  describe('ApiDatabaseIdPutRequest', function() {
    it('should create an instance of ApiDatabaseIdPutRequest', function() {
      // uncomment below and update the code to test ApiDatabaseIdPutRequest
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be.a(MetabaseApi.ApiDatabaseIdPutRequest);
    });

    it('should have the property pointsOfInterest (base name: "points_of_interest")', function() {
      // uncomment below and update the code to test the property pointsOfInterest
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property settings (base name: "settings")', function() {
      // uncomment below and update the code to test the property settings
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property name (base name: "name")', function() {
      // uncomment below and update the code to test the property name
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property cacheTtl (base name: "cache_ttl")', function() {
      // uncomment below and update the code to test the property cacheTtl
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property engine (base name: "engine")', function() {
      // uncomment below and update the code to test the property engine
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property details (base name: "details")', function() {
      // uncomment below and update the code to test the property details
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property autoRunQueries (base name: "auto_run_queries")', function() {
      // uncomment below and update the code to test the property autoRunQueries
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property caveats (base name: "caveats")', function() {
      // uncomment below and update the code to test the property caveats
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property refingerprint (base name: "refingerprint")', function() {
      // uncomment below and update the code to test the property refingerprint
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property schedules (base name: "schedules")', function() {
      // uncomment below and update the code to test the property schedules
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

    it('should have the property description (base name: "description")', function() {
      // uncomment below and update the code to test the property description
      //var instance = new MetabaseApi.ApiDatabaseIdPutRequest();
      //expect(instance).to.be();
    });

  });

}));
