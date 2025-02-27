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
 * The MetabaseApiCache1cacheStrategyTtl model module.
 * @module model/MetabaseApiCache1cacheStrategyTtl
 * @version v1.53.2-SNAPSHOT
 */
class MetabaseApiCache1cacheStrategyTtl {
    /**
     * Constructs a new <code>MetabaseApiCache1cacheStrategyTtl</code>.
     * @alias module:model/MetabaseApiCache1cacheStrategyTtl
     * @param minDurationMs {Number} value must be an integer greater or equal to than zero.
     * @param multiplier {Number} value must be an integer greater than zero.
     * @param type {Object} 
     */
    constructor(minDurationMs, multiplier, type) { 
        
        MetabaseApiCache1cacheStrategyTtl.initialize(this, minDurationMs, multiplier, type);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, minDurationMs, multiplier, type) { 
        obj['min_duration_ms'] = minDurationMs;
        obj['multiplier'] = multiplier;
        obj['type'] = type;
    }

    /**
     * Constructs a <code>MetabaseApiCache1cacheStrategyTtl</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MetabaseApiCache1cacheStrategyTtl} obj Optional instance to populate.
     * @return {module:model/MetabaseApiCache1cacheStrategyTtl} The populated <code>MetabaseApiCache1cacheStrategyTtl</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new MetabaseApiCache1cacheStrategyTtl();

            if (data.hasOwnProperty('min_duration_ms')) {
                obj['min_duration_ms'] = ApiClient.convertToType(data['min_duration_ms'], 'Number');
            }
            if (data.hasOwnProperty('multiplier')) {
                obj['multiplier'] = ApiClient.convertToType(data['multiplier'], 'Number');
            }
            if (data.hasOwnProperty('type')) {
                obj['type'] = ApiClient.convertToType(data['type'], Object);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>MetabaseApiCache1cacheStrategyTtl</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>MetabaseApiCache1cacheStrategyTtl</code>.
     */
    static validateJSON(data) {
        // check to make sure all required properties are present in the JSON string
        for (const property of MetabaseApiCache1cacheStrategyTtl.RequiredProperties) {
            if (!data.hasOwnProperty(property)) {
                throw new Error("The required field `" + property + "` is not found in the JSON data: " + JSON.stringify(data));
            }
        }

        return true;
    }


}

MetabaseApiCache1cacheStrategyTtl.RequiredProperties = ["min_duration_ms", "multiplier", "type"];

/**
 * value must be an integer greater or equal to than zero.
 * @member {Number} min_duration_ms
 */
MetabaseApiCache1cacheStrategyTtl.prototype['min_duration_ms'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} multiplier
 */
MetabaseApiCache1cacheStrategyTtl.prototype['multiplier'] = undefined;

/**
 * @member {Object} type
 */
MetabaseApiCache1cacheStrategyTtl.prototype['type'] = undefined;






export default MetabaseApiCache1cacheStrategyTtl;

