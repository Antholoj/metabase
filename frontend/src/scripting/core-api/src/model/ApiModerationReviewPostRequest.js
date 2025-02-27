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
 * The ApiModerationReviewPostRequest model module.
 * @module model/ApiModerationReviewPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiModerationReviewPostRequest {
    /**
     * Constructs a new <code>ApiModerationReviewPostRequest</code>.
     * @alias module:model/ApiModerationReviewPostRequest
     * @param moderatedItemId {Number} value must be an integer greater than zero.
     * @param moderatedItemType {module:model/ApiModerationReviewPostRequest.ModeratedItemTypeEnum} 
     */
    constructor(moderatedItemId, moderatedItemType) { 
        
        ApiModerationReviewPostRequest.initialize(this, moderatedItemId, moderatedItemType);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, moderatedItemId, moderatedItemType) { 
        obj['moderated_item_id'] = moderatedItemId;
        obj['moderated_item_type'] = moderatedItemType;
    }

    /**
     * Constructs a <code>ApiModerationReviewPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiModerationReviewPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiModerationReviewPostRequest} The populated <code>ApiModerationReviewPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiModerationReviewPostRequest();

            if (data.hasOwnProperty('moderated_item_id')) {
                obj['moderated_item_id'] = ApiClient.convertToType(data['moderated_item_id'], 'Number');
            }
            if (data.hasOwnProperty('moderated_item_type')) {
                obj['moderated_item_type'] = ApiClient.convertToType(data['moderated_item_type'], 'String');
            }
            if (data.hasOwnProperty('status')) {
                obj['status'] = ApiClient.convertToType(data['status'], 'String');
            }
            if (data.hasOwnProperty('text')) {
                obj['text'] = ApiClient.convertToType(data['text'], 'String');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiModerationReviewPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiModerationReviewPostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiModerationReviewPostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['moderated_item_type'] && !(typeof data['moderated_item_type'] === 'string' || data['moderated_item_type'] instanceof String)) {
            throw new Error("Expected the field `moderated_item_type` to be a primitive type in the JSON string but got " + data['moderated_item_type']);
        }
        // ensure the json data is a string
        if (data['status'] && !(typeof data['status'] === 'string' || data['status'] instanceof String)) {
            throw new Error("Expected the field `status` to be a primitive type in the JSON string but got " + data['status']);
        }
        // ensure the json data is a string
        if (data['text'] && !(typeof data['text'] === 'string' || data['text'] instanceof String)) {
            throw new Error("Expected the field `text` to be a primitive type in the JSON string but got " + data['text']);
        }

        return true;
    }


}

ApiModerationReviewPostRequest.RequiredProperties = ["moderated_item_id", "moderated_item_type"];

/**
 * value must be an integer greater than zero.
 * @member {Number} moderated_item_id
 */
ApiModerationReviewPostRequest.prototype['moderated_item_id'] = undefined;

/**
 * @member {module:model/ApiModerationReviewPostRequest.ModeratedItemTypeEnum} moderated_item_type
 */
ApiModerationReviewPostRequest.prototype['moderated_item_type'] = undefined;

/**
 * @member {module:model/ApiModerationReviewPostRequest.StatusEnum} status
 */
ApiModerationReviewPostRequest.prototype['status'] = undefined;

/**
 * @member {String} text
 */
ApiModerationReviewPostRequest.prototype['text'] = undefined;





/**
 * Allowed values for the <code>moderated_item_type</code> property.
 * @enum {String}
 * @readonly
 */
ApiModerationReviewPostRequest['ModeratedItemTypeEnum'] = {

    /**
     * value: "card"
     * @const
     */
    "card": "card",

    /**
     * value: "card"
     * @const
     */
    "card2": "card",

    /**
     * value: "dashboard"
     * @const
     */
    "dashboard": "dashboard",

    /**
     * value: "dashboard"
     * @const
     */
    "dashboard2": "dashboard"
};


/**
 * Allowed values for the <code>status</code> property.
 * @enum {String}
 * @readonly
 */
ApiModerationReviewPostRequest['StatusEnum'] = {

    /**
     * value: "verified"
     * @const
     */
    "verified": "verified"
};



export default ApiModerationReviewPostRequest;

