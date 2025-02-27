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
 * The ApiMtGtapValidatePostRequest model module.
 * @module model/ApiMtGtapValidatePostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiMtGtapValidatePostRequest {
    /**
     * Constructs a new <code>ApiMtGtapValidatePostRequest</code>.
     * @alias module:model/ApiMtGtapValidatePostRequest
     * @param tableId {Number} value must be an integer greater than zero.
     */
    constructor(tableId) { 
        
        ApiMtGtapValidatePostRequest.initialize(this, tableId);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, tableId) { 
        obj['table_id'] = tableId;
    }

    /**
     * Constructs a <code>ApiMtGtapValidatePostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiMtGtapValidatePostRequest} obj Optional instance to populate.
     * @return {module:model/ApiMtGtapValidatePostRequest} The populated <code>ApiMtGtapValidatePostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiMtGtapValidatePostRequest();

            if (data.hasOwnProperty('card_id')) {
                obj['card_id'] = ApiClient.convertToType(data['card_id'], 'Number');
            }
            if (data.hasOwnProperty('table_id')) {
                obj['table_id'] = ApiClient.convertToType(data['table_id'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiMtGtapValidatePostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiMtGtapValidatePostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiMtGtapValidatePostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }

        return true;
    }


}

ApiMtGtapValidatePostRequest.RequiredProperties = ["table_id"];

/**
 * value must be an integer greater than zero.
 * @member {Number} card_id
 */
ApiMtGtapValidatePostRequest.prototype['card_id'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} table_id
 */
ApiMtGtapValidatePostRequest.prototype['table_id'] = undefined;






export default ApiMtGtapValidatePostRequest;

