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


import ApiClient from "../ApiClient";

/**
* ApiLdap service.
* @module api/ApiLdapApi
* @version v1.53.2-SNAPSHOT
*/
export default class ApiLdapApi {

    /**
    * Constructs a new ApiLdapApi. 
    * @alias module:api/ApiLdapApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the apiLdapSettingsPut operation.
     * @callback module:api/ApiLdapApi~apiLdapSettingsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * PUT /api/ldap/settings
     * Update LDAP related settings. You must be a superuser to do this.
     * @param {Object} opts Optional parameters
     * @param {Object.<String, Object>} [body] 
     * @param {module:api/ApiLdapApi~apiLdapSettingsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiLdapSettingsPut(opts, callback) {
      opts = opts || {};
      let postBody = opts['body'];

      let pathParams = {
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = ['application/json'];
      let accepts = [];
      let returnType = null;
      return this.apiClient.callApi(
        '/api/ldap/settings', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }


}
