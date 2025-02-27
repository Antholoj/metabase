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
 * The ApiSetupPostRequestInvite model module.
 * @module model/ApiSetupPostRequestInvite
 * @version v1.53.2-SNAPSHOT
 */
class ApiSetupPostRequestInvite {
    /**
     * Constructs a new <code>ApiSetupPostRequestInvite</code>.
     * @alias module:model/ApiSetupPostRequestInvite
     */
    constructor() { 
        
        ApiSetupPostRequestInvite.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>ApiSetupPostRequestInvite</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiSetupPostRequestInvite} obj Optional instance to populate.
     * @return {module:model/ApiSetupPostRequestInvite} The populated <code>ApiSetupPostRequestInvite</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiSetupPostRequestInvite();

            if (data.hasOwnProperty('email')) {
                obj['email'] = ApiClient.convertToType(data['email'], 'String');
            }
            if (data.hasOwnProperty('first_name')) {
                obj['first_name'] = ApiClient.convertToType(data['first_name'], 'String');
            }
            if (data.hasOwnProperty('last_name')) {
                obj['last_name'] = ApiClient.convertToType(data['last_name'], 'String');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiSetupPostRequestInvite</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiSetupPostRequestInvite</code>.
     */
    static validateJSON(data) {
        // ensure the json data is a string
        if (data['email'] && !(typeof data['email'] === 'string' || data['email'] instanceof String)) {
            throw new Error("Expected the field `email` to be a primitive type in the JSON string but got " + data['email']);
        }
        // ensure the json data is a string
        if (data['first_name'] && !(typeof data['first_name'] === 'string' || data['first_name'] instanceof String)) {
            throw new Error("Expected the field `first_name` to be a primitive type in the JSON string but got " + data['first_name']);
        }
        // ensure the json data is a string
        if (data['last_name'] && !(typeof data['last_name'] === 'string' || data['last_name'] instanceof String)) {
            throw new Error("Expected the field `last_name` to be a primitive type in the JSON string but got " + data['last_name']);
        }

        return true;
    }


}



/**
 * value must be a valid email address.
 * @member {String} email
 */
ApiSetupPostRequestInvite.prototype['email'] = undefined;

/**
 * @member {String} first_name
 */
ApiSetupPostRequestInvite.prototype['first_name'] = undefined;

/**
 * @member {String} last_name
 */
ApiSetupPostRequestInvite.prototype['last_name'] = undefined;






export default ApiSetupPostRequestInvite;

