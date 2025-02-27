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
import MetabaseAnalyzeFingerprintSchemaGlobalFingerprint from './MetabaseAnalyzeFingerprintSchemaGlobalFingerprint';
import MetabaseAnalyzeFingerprintSchemaTypeSpecificFingerprint from './MetabaseAnalyzeFingerprintSchemaTypeSpecificFingerprint';

/**
 * The MetabaseAnalyzeFingerprintSchema1Fingerprint model module.
 * @module model/MetabaseAnalyzeFingerprintSchema1Fingerprint
 * @version v1.53.2-SNAPSHOT
 */
class MetabaseAnalyzeFingerprintSchema1Fingerprint {
    /**
     * Constructs a new <code>MetabaseAnalyzeFingerprintSchema1Fingerprint</code>.
     * @alias module:model/MetabaseAnalyzeFingerprintSchema1Fingerprint
     */
    constructor() { 
        
        MetabaseAnalyzeFingerprintSchema1Fingerprint.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>MetabaseAnalyzeFingerprintSchema1Fingerprint</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/MetabaseAnalyzeFingerprintSchema1Fingerprint} obj Optional instance to populate.
     * @return {module:model/MetabaseAnalyzeFingerprintSchema1Fingerprint} The populated <code>MetabaseAnalyzeFingerprintSchema1Fingerprint</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new MetabaseAnalyzeFingerprintSchema1Fingerprint();

            if (data.hasOwnProperty('experimental')) {
                obj['experimental'] = ApiClient.convertToType(data['experimental'], Object);
            }
            if (data.hasOwnProperty('global')) {
                obj['global'] = MetabaseAnalyzeFingerprintSchemaGlobalFingerprint.constructFromObject(data['global']);
            }
            if (data.hasOwnProperty('type')) {
                obj['type'] = MetabaseAnalyzeFingerprintSchemaTypeSpecificFingerprint.constructFromObject(data['type']);
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>MetabaseAnalyzeFingerprintSchema1Fingerprint</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>MetabaseAnalyzeFingerprintSchema1Fingerprint</code>.
     */
    static validateJSON(data) {
        // validate the optional field `global`
        if (data['global']) { // data not null
          MetabaseAnalyzeFingerprintSchemaGlobalFingerprint.validateJSON(data['global']);
        }
        // validate the optional field `type`
        if (data['type']) { // data not null
          MetabaseAnalyzeFingerprintSchemaTypeSpecificFingerprint.validateJSON(data['type']);
        }

        return true;
    }


}



/**
 * @member {Object} experimental
 */
MetabaseAnalyzeFingerprintSchema1Fingerprint.prototype['experimental'] = undefined;

/**
 * @member {module:model/MetabaseAnalyzeFingerprintSchemaGlobalFingerprint} global
 */
MetabaseAnalyzeFingerprintSchema1Fingerprint.prototype['global'] = undefined;

/**
 * @member {module:model/MetabaseAnalyzeFingerprintSchemaTypeSpecificFingerprint} type
 */
MetabaseAnalyzeFingerprintSchema1Fingerprint.prototype['type'] = undefined;






export default MetabaseAnalyzeFingerprintSchema1Fingerprint;

