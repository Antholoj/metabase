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
    instance = new MetabaseApi.ApiActivityApi();
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

  describe('ApiActivityApi', function() {
    describe('apiActivityMostRecentlyViewedDashboardGet', function() {
      it('should call apiActivityMostRecentlyViewedDashboardGet successfully', function(done) {
        //uncomment below and update the code to test apiActivityMostRecentlyViewedDashboardGet
        //instance.apiActivityMostRecentlyViewedDashboardGet(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
    describe('apiActivityPopularItemsGet', function() {
      it('should call apiActivityPopularItemsGet successfully', function(done) {
        //uncomment below and update the code to test apiActivityPopularItemsGet
        //instance.apiActivityPopularItemsGet(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
    describe('apiActivityRecentViewsGet', function() {
      it('should call apiActivityRecentViewsGet successfully', function(done) {
        //uncomment below and update the code to test apiActivityRecentViewsGet
        //instance.apiActivityRecentViewsGet(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
    describe('apiActivityRecentsGet', function() {
      it('should call apiActivityRecentsGet successfully', function(done) {
        //uncomment below and update the code to test apiActivityRecentsGet
        //instance.apiActivityRecentsGet(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
    describe('apiActivityRecentsPost', function() {
      it('should call apiActivityRecentsPost successfully', function(done) {
        //uncomment below and update the code to test apiActivityRecentsPost
        //instance.apiActivityRecentsPost(function(error) {
        //  if (error) throw error;
        //expect().to.be();
        //});
        done();
      });
    });
  });

}));
