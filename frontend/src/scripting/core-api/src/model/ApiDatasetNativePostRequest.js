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
 * The ApiDatasetNativePostRequest model module.
 * @module model/ApiDatasetNativePostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiDatasetNativePostRequest {
    /**
     * Constructs a new <code>ApiDatasetNativePostRequest</code>.
     * @alias module:model/ApiDatasetNativePostRequest
     * @param database {Number} value must be an integer greater than zero.
     */
    constructor(database) { 
        
        ApiDatasetNativePostRequest.initialize(this, database);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, database) { 
        obj['database'] = database;
        obj['pretty'] = true;
    }

    /**
     * Constructs a <code>ApiDatasetNativePostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDatasetNativePostRequest} obj Optional instance to populate.
     * @return {module:model/ApiDatasetNativePostRequest} The populated <code>ApiDatasetNativePostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDatasetNativePostRequest();

            if (data.hasOwnProperty('database')) {
                obj['database'] = ApiClient.convertToType(data['database'], 'Number');
            }
            if (data.hasOwnProperty('pretty')) {
                obj['pretty'] = ApiClient.convertToType(data['pretty'], 'Boolean');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDatasetNativePostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDatasetNativePostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiDatasetNativePostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }

        return true;
    }


}

ApiDatasetNativePostRequest.RequiredProperties = ["database"];

/**
 * value must be an integer greater than zero.
 * @member {Number} database
 */
ApiDatasetNativePostRequest.prototype['database'] = undefined;

/**
 * @member {Boolean} pretty
 * @default true
 */
ApiDatasetNativePostRequest.prototype['pretty'] = true;






export default ApiDatasetNativePostRequest;

