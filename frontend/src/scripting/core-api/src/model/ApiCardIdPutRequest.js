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
import ApiCardPostRequestParametersInner from './ApiCardPostRequestParametersInner';
import MetabaseAnalyzeQueryResultsResultColumnMetadata from './MetabaseAnalyzeQueryResultsResultColumnMetadata';
import MetabaseApiCardCardType from './MetabaseApiCardCardType';

/**
 * The ApiCardIdPutRequest model module.
 * @module model/ApiCardIdPutRequest
 * @version v1.53.2-SNAPSHOT
 */
class ApiCardIdPutRequest {
    /**
     * Constructs a new <code>ApiCardIdPutRequest</code>.
     * @alias module:model/ApiCardIdPutRequest
     */
    constructor() { 
        
        ApiCardIdPutRequest.initialize(this);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj) { 
    }

    /**
     * Constructs a <code>ApiCardIdPutRequest</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/ApiCardIdPutRequest} obj Optional instance to populate.
     * @return {module:model/ApiCardIdPutRequest} The populated <code>ApiCardIdPutRequest</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new ApiCardIdPutRequest();

            if (data.hasOwnProperty('enable_embedding')) {
                obj['enable_embedding'] = ApiClient.convertToType(data['enable_embedding'], 'Boolean');
            }
            if (data.hasOwnProperty('visualization_settings')) {
                obj['visualization_settings'] = ApiClient.convertToType(data['visualization_settings'], Object);
            }
            if (data.hasOwnProperty('dashboard_tab_id')) {
                obj['dashboard_tab_id'] = ApiClient.convertToType(data['dashboard_tab_id'], 'Number');
            }
            if (data.hasOwnProperty('collection_preview')) {
                obj['collection_preview'] = ApiClient.convertToType(data['collection_preview'], 'Boolean');
            }
            if (data.hasOwnProperty('dataset_query')) {
                obj['dataset_query'] = ApiClient.convertToType(data['dataset_query'], Object);
            }
            if (data.hasOwnProperty('name')) {
                obj['name'] = ApiClient.convertToType(data['name'], 'String');
            }
            if (data.hasOwnProperty('archived')) {
                obj['archived'] = ApiClient.convertToType(data['archived'], 'Boolean');
            }
            if (data.hasOwnProperty('collection_position')) {
                obj['collection_position'] = ApiClient.convertToType(data['collection_position'], 'Number');
            }
            if (data.hasOwnProperty('embedding_params')) {
                obj['embedding_params'] = ApiClient.convertToType(data['embedding_params'], {'String': 'String'});
            }
            if (data.hasOwnProperty('result_metadata')) {
                obj['result_metadata'] = ApiClient.convertToType(data['result_metadata'], [MetabaseAnalyzeQueryResultsResultColumnMetadata]);
            }
            if (data.hasOwnProperty('collection_id')) {
                obj['collection_id'] = ApiClient.convertToType(data['collection_id'], 'Number');
            }
            if (data.hasOwnProperty('cache_ttl')) {
                obj['cache_ttl'] = ApiClient.convertToType(data['cache_ttl'], 'Number');
            }
            if (data.hasOwnProperty('type')) {
                obj['type'] = MetabaseApiCardCardType.constructFromObject(data['type']);
            }
            if (data.hasOwnProperty('display')) {
                obj['display'] = ApiClient.convertToType(data['display'], 'String');
            }
            if (data.hasOwnProperty('parameters')) {
                obj['parameters'] = ApiClient.convertToType(data['parameters'], [ApiCardPostRequestParametersInner]);
            }
            if (data.hasOwnProperty('description')) {
                obj['description'] = ApiClient.convertToType(data['description'], 'String');
            }
            if (data.hasOwnProperty('dashboard_id')) {
                obj['dashboard_id'] = ApiClient.convertToType(data['dashboard_id'], 'Number');
            }
        }
        return obj;
    }

    /**
     * Validates the JSON data with respect to <code>ApiCardIdPutRequest</code>.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @return {boolean} to indicate whether the JSON data is valid with respect to <code>ApiCardIdPutRequest</code>.
     */
    static validateJSON(data) {
        // ensure the json data is a string
        if (data['name'] && !(typeof data['name'] === 'string' || data['name'] instanceof String)) {
            throw new Error("Expected the field `name` to be a primitive type in the JSON string but got " + data['name']);
        }
        if (data['result_metadata']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['result_metadata'])) {
                throw new Error("Expected the field `result_metadata` to be an array in the JSON data but got " + data['result_metadata']);
            }
            // validate the optional field `result_metadata` (array)
            for (const item of data['result_metadata']) {
                MetabaseAnalyzeQueryResultsResultColumnMetadata.validateJSON(item);
            };
        }
        // ensure the json data is a string
        if (data['display'] && !(typeof data['display'] === 'string' || data['display'] instanceof String)) {
            throw new Error("Expected the field `display` to be a primitive type in the JSON string but got " + data['display']);
        }
        if (data['parameters']) { // data not null
            // ensure the json data is an array
            if (!Array.isArray(data['parameters'])) {
                throw new Error("Expected the field `parameters` to be an array in the JSON data but got " + data['parameters']);
            }
            // validate the optional field `parameters` (array)
            for (const item of data['parameters']) {
                ApiCardPostRequestParametersInner.validateJSON(item);
            };
        }
        // ensure the json data is a string
        if (data['description'] && !(typeof data['description'] === 'string' || data['description'] instanceof String)) {
            throw new Error("Expected the field `description` to be a primitive type in the JSON string but got " + data['description']);
        }

        return true;
    }


}



/**
 * @member {Boolean} enable_embedding
 */
ApiCardIdPutRequest.prototype['enable_embedding'] = undefined;

/**
 * Value must be a map.
 * @member {Object} visualization_settings
 */
ApiCardIdPutRequest.prototype['visualization_settings'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} dashboard_tab_id
 */
ApiCardIdPutRequest.prototype['dashboard_tab_id'] = undefined;

/**
 * @member {Boolean} collection_preview
 */
ApiCardIdPutRequest.prototype['collection_preview'] = undefined;

/**
 * Value must be a map.
 * @member {Object} dataset_query
 */
ApiCardIdPutRequest.prototype['dataset_query'] = undefined;

/**
 * @member {String} name
 */
ApiCardIdPutRequest.prototype['name'] = undefined;

/**
 * @member {Boolean} archived
 */
ApiCardIdPutRequest.prototype['archived'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} collection_position
 */
ApiCardIdPutRequest.prototype['collection_position'] = undefined;

/**
 * value must be a valid embedding params map.
 * @member {Object.<String, module:model/ApiCardIdPutRequest.InnerEnum>} embedding_params
 */
ApiCardIdPutRequest.prototype['embedding_params'] = undefined;

/**
 * value must be an array of valid results column metadata maps.
 * @member {Array.<module:model/MetabaseAnalyzeQueryResultsResultColumnMetadata>} result_metadata
 */
ApiCardIdPutRequest.prototype['result_metadata'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} collection_id
 */
ApiCardIdPutRequest.prototype['collection_id'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} cache_ttl
 */
ApiCardIdPutRequest.prototype['cache_ttl'] = undefined;

/**
 * @member {module:model/MetabaseApiCardCardType} type
 */
ApiCardIdPutRequest.prototype['type'] = undefined;

/**
 * @member {String} display
 */
ApiCardIdPutRequest.prototype['display'] = undefined;

/**
 * @member {Array.<module:model/ApiCardPostRequestParametersInner>} parameters
 */
ApiCardIdPutRequest.prototype['parameters'] = undefined;

/**
 * @member {String} description
 */
ApiCardIdPutRequest.prototype['description'] = undefined;

/**
 * value must be an integer greater than zero.
 * @member {Number} dashboard_id
 */
ApiCardIdPutRequest.prototype['dashboard_id'] = undefined;





/**
 * Allowed values for the <code>inner</code> property.
 * @enum {String}
 * @readonly
 */
ApiCardIdPutRequest['InnerEnum'] = {

    /**
     * value: "disabled"
     * @const
     */
    "disabled": "disabled",

    /**
     * value: "enabled"
     * @const
     */
    "enabled": "enabled",

    /**
     * value: "locked"
     * @const
     */
    "locked": "locked"
};



export default ApiCardIdPutRequest;

