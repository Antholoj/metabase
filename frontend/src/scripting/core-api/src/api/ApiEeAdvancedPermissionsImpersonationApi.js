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
* ApiEeAdvancedPermissionsImpersonation service.
* @module api/ApiEeAdvancedPermissionsImpersonationApi
* @version v1.53.2-SNAPSHOT
*/
export default class ApiEeAdvancedPermissionsImpersonationApi {

    /**
    * Constructs a new ApiEeAdvancedPermissionsImpersonationApi. 
    * @alias module:api/ApiEeAdvancedPermissionsImpersonationApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the apiEeAdvancedPermissionsImpersonationGet operation.
     * @callback module:api/ApiEeAdvancedPermissionsImpersonationApi~apiEeAdvancedPermissionsImpersonationGetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * GET /api/ee/advanced-permissions/impersonation/
     * Fetch a list of all Impersonation policies currently in effect, or a single policy if both `group_id` and `db_id`   are provided.
     * @param {Object} opts Optional parameters
     * @param {Number} [groupId] value must be an integer greater than zero.
     * @param {Number} [dbId] value must be an integer greater than zero.
     * @param {module:api/ApiEeAdvancedPermissionsImpersonationApi~apiEeAdvancedPermissionsImpersonationGetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiEeAdvancedPermissionsImpersonationGet(opts, callback) {
      opts = opts || {};
      let postBody = null;

      let pathParams = {
      };
      let queryParams = {
        'group_id': opts['groupId'],
        'db_id': opts['dbId']
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;
      return this.apiClient.callApi(
        '/api/ee/advanced-permissions/impersonation/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }

    /**
     * Callback function to receive the result of the apiEeAdvancedPermissionsImpersonationIdDelete operation.
     * @callback module:api/ApiEeAdvancedPermissionsImpersonationApi~apiEeAdvancedPermissionsImpersonationIdDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * DELETE /api/ee/advanced-permissions/impersonation/{id}
     * Delete a Connection Impersonation entry.
     * @param {Number} id value must be an integer greater than zero.
     * @param {module:api/ApiEeAdvancedPermissionsImpersonationApi~apiEeAdvancedPermissionsImpersonationIdDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    apiEeAdvancedPermissionsImpersonationIdDelete(id, callback) {
      let postBody = null;
      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling apiEeAdvancedPermissionsImpersonationIdDelete");
      }

      let pathParams = {
        'id': id
      };
      let queryParams = {
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = null;
      return this.apiClient.callApi(
        '/api/ee/advanced-permissions/impersonation/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, null, callback
      );
    }


}
