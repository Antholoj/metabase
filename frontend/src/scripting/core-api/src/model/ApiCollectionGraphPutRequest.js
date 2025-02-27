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
 * The ApiCollectionGraphPutRequest model module.
 * @module model/ApiCollectionGraphPutRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiCollectionGraphPutRequest {
    /**
     * Constructs a new <code>ApiCollectionGraphPutRequest</code>.
     * @alias module:model/ApiCollectionGraphPutRequest
     * @param groups {Object} 
     */
    constructor(groups) { 
        
        ApiCollectionGraphPutRequest.initialize(this, groups);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, groups) { 
        obj['groups'] = groups;
    }

    /**
     * Constructs a <code>ApiCollectionGraphPutRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiCollectionGraphPutRequest} obj Optional instance to populate.
     * @return {module:model/ApiCollectionGraphPutRequest} The populated <code>ApiCollectionGraphPutRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiCollectionGraphPutRequest();

            if (data.hasOwnProperty('groups')) {
                obj['groups'] = ApiClient.convertToType(data['groups'], Object);
            }
            if (data.hasOwnProperty('namespace')) {
                obj['namespace'] = ApiClient.convertToType(data['namespace'], 'String');
            }
            if (data.hasOwnProperty('revision')) {
                obj['revision'] = ApiClient.convertToType(data['revision'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiCollectionGraphPutRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiCollectionGraphPutRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiCollectionGraphPutRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['namespace'] && !(typeof data['namespace'] === 'string' || data['namespace'] instanceof String)) {
            throw new Error("Expected the field `namespace` to be a primitive type in the JSON string but got " + data['namespace']);
        }

        return true;
    }


}

ApiCollectionGraphPutRequest.RequiredProperties = ["groups"];

/**
 * @member {Object} groups
 */
ApiCollectionGraphPutRequest.prototype['groups'] = undefined;

/**
 * @member {String} namespace
 */
ApiCollectionGraphPutRequest.prototype['namespace'] = undefined;

/**
 * value must be an integer.
 * @member {Number} revision
 */
ApiCollectionGraphPutRequest.prototype['revision'] = undefined;






export default ApiCollectionGraphPutRequest;

