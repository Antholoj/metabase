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
import ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner from './ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner';

/**
 * The ApiDashboardIdPutRequestDashcardsInner model module.
 * @module model/ApiDashboardIdPutRequestDashcardsInner
 * @version v1.53.2-SNAPSHOT
 */
class ApiDashboardIdPutRequestDashcardsInner {
    /**
     * Constructs a new <code>ApiDashboardIdPutRequestDashcardsInner</code>.
     * @alias module:model/ApiDashboardIdPutRequestDashcardsInner
     * @param col {Number} value must be an integer greater or equal to than zero.
     * @param id {Number} 
     * @param row {Number} value must be an integer greater or equal to than zero.
     * @param sizeX {Number} value must be an integer greater than zero.
     * @param sizeY {Number} value must be an integer greater than zero.
     */
    constructor(col, id, row, sizeX, sizeY) { 
        
        ApiDashboardIdPutRequestDashcardsInner.initialize(this, col, id, row, sizeX, sizeY);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, col, id, row, sizeX, sizeY) { 
        obj['col'] = col;
        obj['id'] = id;
        obj['row'] = row;
        obj['size_x'] = sizeX;
        obj['size_y'] = sizeY;
    }

    /**
     * Constructs a <code>ApiDashboardIdPutRequestDashcardsInner</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiDashboardIdPutRequestDashcardsInner} obj Optional instance to populate.
     * @return {module:model/ApiDashboardIdPutRequestDashcardsInner} The populated <code>ApiDashboardIdPutRequestDashcardsInner</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiDashboardIdPutRequestDashcardsInner();

            if (data.hasOwnProperty('col')) {
                obj['col'] = ApiClient.convertToType(data['col'], 'Number');
            }
            if (data.hasOwnProperty('id')) {
                obj['id'] = ApiClient.convertToType(data['id'], 'Number');
            }
            if (data.hasOwnProperty('parameter_mappings')) {
                obj['parameter_mappings'] = ApiClient.convertToType(data['parameter_mappings'], [ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner]);
            }
            if (data.hasOwnProperty('row')) {
                obj['row'] = ApiClient.convertToType(data['row'], 'Number');
            }
            if (data.hasOwnProperty('series')) {
                obj['series'] = ApiClient.convertToType(data['series'], [Object]);
            }
            if (data.hasOwnProperty('size_x')) {
                obj['size_x'] = ApiClient.convertToType(data['size_x'], 'Number');
            }
            if (data.hasOwnProperty('size_y')) {
                obj['size_y'] = ApiClient.convertToType(data['size_y'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiDashboardIdPutRequestDashcardsInner</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiDashboardIdPutRequestDashcardsInner</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiDashboardIdPutRequestDashcardsInner.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        if (data['parameter_mappings']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['parameter_mappings'])) {
                throw new Error("Expected the field `parameter_mappings` to be an array in the JSON data but got " + data['parameter_mappings']);
            }
            // validate the optional field `parameter_mappings` (array)
            for (const item of data['parameter_mappings']) {
                ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner.validateJSON(item);
            };
        }
        // ensure the json data is an array
        if (!Array.isArray(data['series'])) {
            throw new Error("Expected the field `series` to be an array in the JSON data but got " + data['series']);
        }

        return true;
    }


}

ApiDashboardIdPutRequestDashcardsInner.RequiredProperties = ["col", "id", "row", "size_x", "size_y"];

/**
 * value must be an integer greater or equal to than zero.
 * @member {Number} col
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['col'] = undefined;

/**
 * @member {Number} id
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['id'] = undefined;

/**
 * @member {Array.<module:model/ApiDashboardIdPutRequestDashcardsInnerParameterMappingsInner>} parameter_mappings
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['parameter_mappings'] = undefined;

/**
 * value must be an integer greater or equal to than zero.
 * @member {Number} row
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['row'] = undefined;

/**
 * @member {Array.<Object>} series
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['series'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} size_x
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['size_x'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} size_y
 */
ApiDashboardIdPutRequestDashcardsInner.prototype['size_y'] = undefined;






export default ApiDashboardIdPutRequestDashcardsInner;

