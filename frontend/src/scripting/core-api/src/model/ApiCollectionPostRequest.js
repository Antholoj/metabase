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
 * The ApiCollectionPostRequest model module.
 * @module model/ApiCollectionPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiCollectionPostRequest {
    /**
     * Constructs a new <code>ApiCollectionPostRequest</code>.
     * @alias module:model/ApiCollectionPostRequest
     * @param name {String} 
     */
    constructor(name) { 
        
        ApiCollectionPostRequest.initialize(this, name);
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
     * Constructs a <code>ApiCollectionPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiCollectionPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiCollectionPostRequest} The populated <code>ApiCollectionPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiCollectionPostRequest();

            if (data.hasOwnProperty('authority_level')) {
                obj['authority_level'] = ApiClient.convertToType(data['authority_level'], 'String');
            }
            if (data.hasOwnProperty('description')) {
                obj['description'] = ApiClient.convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = ApiClient.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('namespace')) {
                obj['namespace'] = ApiClient.convertToType(data['namespace'], 'String');
            }
            if (data.hasOwnProperty('parent_id')) {
                obj['parent_id'] = ApiClient.convertToType(data['parent_id'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiCollectionPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiCollectionPostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiCollectionPostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['authority_level'] && !(typeof data['authority_level'] === 'string' || data['authority_level'] instanceof String)) {
            throw new Error("Expected the field `authority_level` to be a primitive type in the JSON string but got " + data['authority_level']);
        }
        // ensure the json data is a string
        if (data['description'] && !(typeof data['description'] === 'string' || data['description'] instanceof String)) {
            throw new Error("Expected the field `description` to be a primitive type in the JSON string but got " + data['description']);
        }
        // ensure the json data is a string
        if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
        }
        // ensure the json data is a string
        if (data['namespace'] && !(typeof data['namespace'] === 'string' || data['namespace'] instanceof String)) {
            throw new Error("Expected the field `namespace` to be a primitive type in the JSON string but got " + data['namespace']);
        }

        return true;
    }


}

ApiCollectionPostRequest.RequiredProperties = ["name"];

/**
 * @member {module:model/ApiCollectionPostRequest.AuthorityLevelEnum} authority_level
 */
ApiCollectionPostRequest.prototype['authority_level'] = undefined;

/**
 * @member {String} description
 */
ApiCollectionPostRequest.prototype['description'] = undefined;

/**
 * @member {String} name
 */
ApiCollectionPostRequest.prototype['name'] = undefined;

/**
 * @member {String} namespace
 */
ApiCollectionPostRequest.prototype['namespace'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} parent_id
 */
ApiCollectionPostRequest.prototype['parent_id'] = undefined;





/**
 * Allowed values for the <code>authority_level</code> property.
 * @enum {String}
 * @readonly
 */
ApiCollectionPostRequest['AuthorityLevelEnum'] = {

    /**
     * value: "official"
     * @const
     */
    "official": "official"
};



export default ApiCollectionPostRequest;

