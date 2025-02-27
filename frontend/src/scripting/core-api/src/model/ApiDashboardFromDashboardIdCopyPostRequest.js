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

import ApiClient from '../ApiClient';

/**
 * The ApiDashboardFromDashboardIdCopyPostRequest model module.
 * @module model/ApiDashboardFromDashboardIdCopyPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiDashboardFromDashboardIdCopyPostRequest {
    /**
     * Constructs a new <code>ApiDashboardFromDashboardIdCopyPostRequest</code>.
     * @alias module:model/ApiDashboardFromDashboardIdCopyPostRequest
     */
    constructor() { 
        
        ApiDashboardFromDashboardIdCopyPostRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
        obj['is_deep_copy'] = false;
    }

    /**
     * Constructs a <code>ApiDashboardFromDashboardIdCopyPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDashboardFromDashboardIdCopyPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiDashboardFromDashboardIdCopyPostRequest} The populated <code>ApiDashboardFromDashboardIdCopyPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDashboardFromDashboardIdCopyPostRequest();

            if (data.hasOwnProperty('collection_id')) {
                obj['collection_id'] = ApiClient.convertToType(data['collection_id'], 'Number');
            }
            if (data.hasOwnProperty('collection_position')) {
                obj['collection_position'] = ApiClient.convertToType(data['collection_position'], 'Number');
            }
            if (data.hasOwnProperty('description')) {
                obj['description'] = ApiClient.convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('is_deep_copy')) {
                obj['is_deep_copy'] = ApiClient.convertToType(data['is_deep_copy'], 'Boolean');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = ApiClient.convertToType(data['name'], 'String');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDashboardFromDashboardIdCopyPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDashboardFromDashboardIdCopyPostRequest</code>.
     */
    static validateJSON(data) {
        // ensure the json data is a string
        if (data['description'] && !(typeof data['description'] === 'string' || data['description'] instanceof String)) {
            throw new Error("Expected the field `description` to be a primitive type in the JSON string but got " + data['description']);
        }
        // ensure the json data is a string
        if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
        }

        return true;
    }


}



/**
 * value must be an integer greater than zero.
 * @member {Number} collection_id
 */
ApiDashboardFromDashboardIdCopyPostRequest.prototype['collection_id'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} collection_position
 */
ApiDashboardFromDashboardIdCopyPostRequest.prototype['collection_position'] = undefined;

/**
 * @member {String} description
 */
ApiDashboardFromDashboardIdCopyPostRequest.prototype['description'] = undefined;

/**
 * @member {Boolean} is_deep_copy
 * @default false
 */
ApiDashboardFromDashboardIdCopyPostRequest.prototype['is_deep_copy'] = false;

/**
 * @member {String} name
 */
ApiDashboardFromDashboardIdCopyPostRequest.prototype['name'] = undefined;






export default ApiDashboardFromDashboardIdCopyPostRequest;

