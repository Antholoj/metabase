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
 * The ApiDatasetPivotPostRequest model module.
 * @module model/ApiDatasetPivotPostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiDatasetPivotPostRequest {
    /**
     * Constructs a new <code>ApiDatasetPivotPostRequest</code>.
     * @alias module:model/ApiDatasetPivotPostRequest
     */
    constructor() { 
        
        ApiDatasetPivotPostRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>ApiDatasetPivotPostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDatasetPivotPostRequest} obj Optional instance to populate.
     * @return {module:model/ApiDatasetPivotPostRequest} The populated <code>ApiDatasetPivotPostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDatasetPivotPostRequest();

            if (data.hasOwnProperty('database')) {
                obj['database'] = ApiClient.convertToType(data['database'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDatasetPivotPostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDatasetPivotPostRequest</code>.
     */
    static validateJSON(data) {

        return true;
    }


}



/**
 * value must be an integer greater than zero.
 * @member {Number} database
 */
ApiDatasetPivotPostRequest.prototype['database'] = undefined;






export default ApiDatasetPivotPostRequest;

