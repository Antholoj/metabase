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
import ApiCardPostRequestParametersInner from './ApiCardPostRequestParametersInner';

/**
 * The ApiDashboardPostRequest model module.
 * @module model/ApiDashboardPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiDashboardPostRequest {
    /**
     * Constructs a new <code>ApiDashboardPostRequest</code>.
     * @alias module:model/ApiDashboardPostRequest
     * @param name {String} 
     */
    constructor(name) { 
        
        ApiDashboardPostRequest.initialize(this, name);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, name) { 
        obj['name'] = name;
    }

    /**
     * Constructs a <code>ApiDashboardPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDashboardPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiDashboardPostRequest} The populated <code>ApiDashboardPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDashboardPostRequest();

            if (data.hasOwnProperty('cache_ttl')) {
                obj['cache_ttl'] = ApiClient.convertToType(data['cache_ttl'], 'Number');
            }
            if (data.hasOwnProperty('collection_id')) {
                obj['collection_id'] = ApiClient.convertToType(data['collection_id'], 'Number');
            }
            if (data.hasOwnProperty('collection_position')) {
                obj['collection_position'] = ApiClient.convertToType(data['collection_position'], 'Number');
            }
            if (data.hasOwnProperty('description')) {
                obj['description'] = ApiClient.convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = ApiClient.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('parameters')) {
                obj['parameters'] = ApiClient.convertToType(data['parameters'], [ApiCardPostRequestParametersInner]);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDashboardPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDashboardPostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiDashboardPostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['description'] && !(typeof data['description'] === 'string' || data['description'] instanceof String)) {
            throw new Error("Expected the field `description` to be a primitive type in the JSON string but got " + data['description']);
        }
        // ensure the json data is a string
        if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
        }
        if (data['parameters']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['parameters'])) {
                throw new Error("Expected the field `parameters` to be an array in the JSON data but got " + data['parameters']);
            }
            // validate the optional field `parameters` (array)
            for (const item of data['parameters']) {
                ApiCardPostRequestParametersInner.validateJSON(item);
            };
        }

        return true;
    }


}

ApiDashboardPostRequest.RequiredProperties = ["name"];

/**
 * value must be an integer greater than zero.
 * @member {Number} cache_ttl
 */
ApiDashboardPostRequest.prototype['cache_ttl'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} collection_id
 */
ApiDashboardPostRequest.prototype['collection_id'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} collection_position
 */
ApiDashboardPostRequest.prototype['collection_position'] = undefined;

/**
 * @member {String} description
 */
ApiDashboardPostRequest.prototype['description'] = undefined;

/**
 * @member {String} name
 */
ApiDashboardPostRequest.prototype['name'] = undefined;

/**
 * @member {Array.<module:model/ApiCardPostRequestParametersInner>} parameters
 */
ApiDashboardPostRequest.prototype['parameters'] = undefined;






export default ApiDashboardPostRequest;

