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
 * The ApiNotifyDbIdNewTablePostRequest model module.
 * @module model/ApiNotifyDbIdNewTablePostRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiNotifyDbIdNewTablePostRequest {
    /**
     * Constructs a new <code>ApiNotifyDbIdNewTablePostRequest</code>.
     * @alias module:model/ApiNotifyDbIdNewTablePostRequest
     * @param schemaName {String} 
     * @param tableName {String} 
     */
    constructor(schemaName, tableName) { 
        
        ApiNotifyDbIdNewTablePostRequest.initialize(this, schemaName, tableName);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, schemaName, tableName) { 
        obj['schema_name'] = schemaName;
        obj['table_name'] = tableName;
    }

    /**
     * Constructs a <code>ApiNotifyDbIdNewTablePostRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiNotifyDbIdNewTablePostRequest} obj Optional instance to populate.
     * @return {module:model/ApiNotifyDbIdNewTablePostRequest} The populated <code>ApiNotifyDbIdNewTablePostRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiNotifyDbIdNewTablePostRequest();

            if (data.hasOwnProperty('schema_name')) {
                obj['schema_name'] = ApiClient.convertToType(data['schema_name'], 'String');
            }
            if (data.hasOwnProperty('table_name')) {
                obj['table_name'] = ApiClient.convertToType(data['table_name'], 'String');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiNotifyDbIdNewTablePostRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiNotifyDbIdNewTablePostRequest</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of ApiNotifyDbIdNewTablePostRequest.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }
        // ensure the json data is a string
        if (data['schema_name'] && !(typeof data['schema_name'] === 'string' || data['schema_name'] instanceof String)) {
            throw new Error("Expected the field `schema_name` to be a primitive type in the JSON string but got " + data['schema_name']);
        }
        // ensure the json data is a string
        if (data['table_name'] && !(typeof data['table_name'] === 'string' || data['table_name'] instanceof String)) {
            throw new Error("Expected the field `table_name` to be a primitive type in the JSON string but got " + data['table_name']);
        }

        return true;
    }


}

ApiNotifyDbIdNewTablePostRequest.RequiredProperties = ["schema_name", "table_name"];

/**
 * @member {String} schema_name
 */
ApiNotifyDbIdNewTablePostRequest.prototype['schema_name'] = undefined;

/**
 * @member {String} table_name
 */
ApiNotifyDbIdNewTablePostRequest.prototype['table_name'] = undefined;






export default ApiNotifyDbIdNewTablePostRequest;

