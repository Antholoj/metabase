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
 * The MetabaseAnalyzeFingerprintSchemaGlobalFingerprint model module.
 * @module model/MetabaseAnalyzeFingerprintSchemaGlobalFingerprint
 * @version v1.53.2-SNAPSHOT
 */
class MetabaseAnalyzeFingerprintSchemaGlobalFingerprint {
    /**
     * Constructs a new <code>MetabaseAnalyzeFingerprintSchemaGlobalFingerprint</code>.
     * @alias module:model/MetabaseAnalyzeFingerprintSchemaGlobalFingerprint
     */
    constructor() { 
        
        MetabaseAnalyzeFingerprintSchemaGlobalFingerprint.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>MetabaseAnalyzeFingerprintSchemaGlobalFingerprint</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MetabaseAnalyzeFingerprintSchemaGlobalFingerprint} obj Optional instance to populate.
     * @return {module:model/MetabaseAnalyzeFingerprintSchemaGlobalFingerprint} The populated <code>MetabaseAnalyzeFingerprintSchemaGlobalFingerprint</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new MetabaseAnalyzeFingerprintSchemaGlobalFingerprint();

            if (data.hasOwnProperty('distinct-count')) {
                obj['distinct-count'] = ApiClient.convertToType(data['distinct-count'], 'Number');
            }
            if (data.hasOwnProperty('nil%')) {
                obj['nil%'] = ApiClient.convertToType(data['nil%'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>MetabaseAnalyzeFingerprintSchemaGlobalFingerprint</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>MetabaseAnalyzeFingerprintSchemaGlobalFingerprint</code>.
     */
    static validateJSON(data) {

        return true;
    }


}



/**
 * @member {Number} distinct-count
 */
MetabaseAnalyzeFingerprintSchemaGlobalFingerprint.prototype['distinct-count'] = undefined;

/**
 * @member {Number} nil%
 */
MetabaseAnalyzeFingerprintSchemaGlobalFingerprint.prototype['nil%'] = undefined;






export default MetabaseAnalyzeFingerprintSchemaGlobalFingerprint;

