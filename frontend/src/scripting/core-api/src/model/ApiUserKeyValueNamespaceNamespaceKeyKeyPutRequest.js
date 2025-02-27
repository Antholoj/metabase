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
import MetabaseLibSchemaLiteralStringDatetime from './MetabaseLibSchemaLiteralStringDatetime';

/**
 * The ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest model module.
 * @module model/ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest {
    /**
     * Constructs a new <code>ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest</code>.
     * @alias module:model/ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest
     */
    constructor() { 
        
        ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest} obj Optional instance to populate.
     * @return {module:model/ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest} The populated <code>ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest();

            if (data.hasOwnProperty('expires_at')) {
                obj['expires_at'] = MetabaseLibSchemaLiteralStringDatetime.constructFromObject(data['expires_at']);
            }
            if (data.hasOwnProperty('value')) {
                obj['value'] = ApiClient.convertToType(data['value'], Object);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest</code>.
     */
    static validateJSON(data) {
        // validate the optional field `expires_at`
        if (data['expires_at']) { // data not null
          MetabaseLibSchemaLiteralStringDatetime.validateJSON(data['expires_at']);
        }

        return true;
    }


}



/**
 * @member {module:model/MetabaseLibSchemaLiteralStringDatetime} expires_at
 */
ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest.prototype['expires_at'] = undefined;

/**
 * @member {Object} value
 */
ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest.prototype['value'] = undefined;






export default ApiUserKeyValueNamespaceNamespaceKeyKeyPutRequest;

