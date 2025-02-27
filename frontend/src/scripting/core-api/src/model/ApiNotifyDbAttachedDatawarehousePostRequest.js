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
 * The ApiNotifyDbAttachedDatawarehousePostRequest model module.
 * @module model/ApiNotifyDbAttachedDatawarehousePostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiNotifyDbAttachedDatawarehousePostRequest {
    /**
     * Constructs a new <code>ApiNotifyDbAttachedDatawarehousePostRequest</code>.
     * @alias module:model/ApiNotifyDbAttachedDatawarehousePostRequest
     */
    constructor() { 
        
        ApiNotifyDbAttachedDatawarehousePostRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
        obj['synchronous?'] = false;
    }

    /**
     * Constructs a <code>ApiNotifyDbAttachedDatawarehousePostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiNotifyDbAttachedDatawarehousePostRequest} obj Optional instance to populate.
     * @return {module:model/ApiNotifyDbAttachedDatawarehousePostRequest} The populated <code>ApiNotifyDbAttachedDatawarehousePostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiNotifyDbAttachedDatawarehousePostRequest();

            if (data.hasOwnProperty('schema_name')) {
                obj['schema_name'] = ApiClient.convertToType(data['schema_name'], 'String');
            }
            if (data.hasOwnProperty('synchronous?')) {
                obj['synchronous?'] = ApiClient.convertToType(data['synchronous?'], 'Boolean');
            }
            if (data.hasOwnProperty('table_name')) {
                obj['table_name'] = ApiClient.convertToType(data['table_name'], 'String');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiNotifyDbAttachedDatawarehousePostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiNotifyDbAttachedDatawarehousePostRequest</code>.
     */
    static validateJSON(data) {
        // ensure the json data is a string
        if (data['schema_name'] && !(typeof data['schema_name'] === 'string' || data['schema_name'] instanceof String)) {
            throw new Error("Expected the field `schema_name` to be a primitive type in the JSON string but got " + data['schema_name']);
        }
        // ensure the json data is a string
        if (data['table_name'] && !(typeof data['table_name'] === 'string' || data['table_name'] instanceof String)) {
            throw new Error("Expected the field `table_name` to be a primitive type in the JSON string but got " + data['table_name']);
        }

        return true;
    }


}



/**
 * @member {String} schema_name
 */
ApiNotifyDbAttachedDatawarehousePostRequest.prototype['schema_name'] = undefined;

/**
 * @member {Boolean} synchronous?
 * @default false
 */
ApiNotifyDbAttachedDatawarehousePostRequest.prototype['synchronous?'] = false;

/**
 * @member {String} table_name
 */
ApiNotifyDbAttachedDatawarehousePostRequest.prototype['table_name'] = undefined;






export default ApiNotifyDbAttachedDatawarehousePostRequest;

