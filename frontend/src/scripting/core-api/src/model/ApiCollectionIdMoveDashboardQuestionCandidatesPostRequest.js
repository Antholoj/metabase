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
 * The ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest model module.
 * @module model/ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest {
    /**
     * Constructs a new <code>ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest</code>.
     * @alias module:model/ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest
     */
    constructor() { 
        
        ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest} The populated <code>ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest();

            if (data.hasOwnProperty('card_ids')) {
                obj['card_ids'] = ApiClient.convertToType(data['card_ids'], ['Number']);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest</code>.
     */
    static validateJSON(data) {
        // ensure the json data is an array
        if (!Array.isArray(data['card_ids'])) {
            throw new Error("Expected the field `card_ids` to be an array in the JSON data but got " + data['card_ids']);
        }

        return true;
    }


}



/**
 * @member {Array.<Number>} card_ids
 */
ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest.prototype['card_ids'] = undefined;






export default ApiCollectionIdMoveDashboardQuestionCandidatesPostRequest;

