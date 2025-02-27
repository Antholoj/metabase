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
 * The ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner model module.
 * @module model/ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner
 * @version v1.53.2-SNAPSHOT
 */
class ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner {
    /**
     * Constructs a new <code>ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner</code>.
     * @alias module:model/ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner
     * @param parameterId {String} 
     * @param target {Object} 
     */
    constructor(parameterId, target) { 
        
        ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.initialize(this, parameterId, target);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, parameterId, target) { 
        obj['parameter_id'] = parameterId;
        obj['target'] = target;
    }

    /**
     * Constructs a <code>ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner} obj Optional instance to populate.
     * @return {module:model/ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner} The populated <code>ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner();

            if (data.hasOwnProperty('parameter_id')) {
                obj['parameter_id'] = ApiClient.convertToType(data['parameter_id'], 'String');
            }
            if (data.hasOwnProperty('target')) {
                obj['target'] = ApiClient.convertToType(data['target'], Object);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['parameter_id'] && !(typeof data['parameter_id'] === 'string' || data['parameter_id'] instanceof String)) {
            throw new Error("Expected the field `parameter_id` to be a primitive type in the JSON string but got " + data['parameter_id']);
        }

        return true;
    }


}

ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.RequiredProperties = ["parameter_id", "target"];

/**
 * @member {String} parameter_id
 */
ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.prototype['parameter_id'] = undefined;

/**
 * @member {Object} target
 */
ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.prototype['target'] = undefined;






export default ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner;

