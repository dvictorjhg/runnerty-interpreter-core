import sizeof from 'object-sizeof';
import { interpret } from './lib/interpret';

// Recursive Object Interpreter:
export default class interpreter {
  static globalValues = {};

  static async interpret(inputObject, objParams, options, globalValues) {
    let params;
    if (options?.maxSize && sizeof(inputObject) > options.maxSize) {
      return inputObject;
    }

    if (objParams && Object.keys(objParams).length !== 0) {
      if (!objParams.objParamsIsReplaced) {
        objParams.objParamsReplaced = await this.interpret(objParams, {}, options, globalValues);
        objParams.objParamsIsReplaced = true;
        params = objParams.objParamsReplaced;
      } else {
        params = objParams.objParamsReplaced;
      }
    }

    if (!options?.ignoreGlobalValues) {
      if (globalValues) {
        Object.assign(this.globalValues, globalValues);
        params = await this._addGlobalValuesToObjParams(params, this.globalValues);
      } else if (this.globalValues) {
        params = await this._addGlobalValuesToObjParams(params, this.globalValues);
      }
    }

    if (typeof inputObject === 'string') {
      const res = await this._interpretSecure(objParams, inputObject, params, options);
      return res;
    } else if (inputObject instanceof Array) {
      const promArr = [];
      for (const item of inputObject) {
        promArr.push(await this.interpret(item, objParams, options, globalValues));
      }
      return await Promise.all(promArr);
    } else if (inputObject instanceof Object) {
      const keys = Object.keys(inputObject);
      const resObject = {};

      for (const key of keys) {
        const _value = await this.interpret(inputObject[key], objParams, options, globalValues);
        const _key = await this._interpretSecure(objParams, key, params, options);
        resObject[_key] = _value;
      }
      return resObject;
    } else {
      return inputObject;
    }
  }

  static async _addGlobalValuesToObjParams(objParams, globalValues) {
    const rw_options = {
      ignoreGlobalValues: true
    };
    const gvs = globalValues;
    let res = {};

    if (Array.isArray(gvs)) {
      for (const gv of gvs) {
        const keymaster = Object.keys(gv)[0];
        const valueObjects = gv[keymaster];
        const keysValueObjects = Object.keys(valueObjects);

        for (const valueKey of keysValueObjects) {
          const intialValue = gv[keymaster][valueKey];

          if (intialValue instanceof Object) {
            if (intialValue.format === 'text') {
              if (intialValue.value instanceof Array) {
                let i = intialValue.value.length;
                let finalValue = '';

                for (const initValue of intialValue.value) {
                  i--;
                  const rtext = initValue;

                  const quotechar = intialValue.quotechar || '';
                  const delimiter = intialValue.delimiter || '';

                  if (i !== 0) {
                    finalValue = finalValue + quotechar + rtext + quotechar + delimiter;
                  } else {
                    finalValue = finalValue + quotechar + rtext + quotechar;
                  }
                }

                res[keymaster + '_' + valueKey] = finalValue;
              } else {
                const value = intialValue.value;
                res[keymaster + '_' + valueKey] = value;
              }
            } else if (intialValue.format === 'json') {
              res[keymaster + '_' + valueKey] = await this._interpretSecure(
                objParams,
                JSON.stringify(intialValue.value),
                objParams,
                rw_options
              );
            } else if (!intialValue.format) {
              res[keymaster + '_' + valueKey] = intialValue;
            }
          } else {
            res[keymaster + '_' + valueKey] = intialValue;
          }
        }
      }
    } else if (gvs instanceof Object) {
      const keysValueObjects = Object.keys(gvs);
      for (const valueKey of keysValueObjects) {
        const intialValue = gvs[valueKey];

        if (intialValue instanceof Object) {
          if (intialValue.format === 'text') {
            if (intialValue.value instanceof Array) {
              let i = intialValue.value.length;
              let finalValue = '';

              for (const initValue of intialValue.value) {
                i--;
                const rtext = initValue;

                const quotechar = intialValue.quotechar || '';
                const delimiter = intialValue.delimiter || '';

                if (i !== 0) {
                  finalValue = finalValue + quotechar + rtext + quotechar + delimiter;
                } else {
                  finalValue = finalValue + quotechar + rtext + quotechar;
                }
              }

              res[valueKey] = finalValue;
            } else {
              const value = intialValue.value;
              res[valueKey] = value;
            }
          } else if (intialValue.format === 'json') {
            res[valueKey] = await this._interpretSecure(
              objParams,
              JSON.stringify(intialValue.value),
              objParams,
              rw_options
            );
          } else if (!intialValue.format) {
            res[valueKey] = intialValue;
          }
        } else {
          res[valueKey] = intialValue;
        }
      }
    }

    Object.assign(res, objParams);
    return res;
  }

  static async _interpretSecure(objParams, inputObject, params, options) {
    try {
      const interpret_res = await interpret(inputObject, params);
      return interpret_res;
    } catch (err) {
      let msg = '';
      if (objParams?.CHAIN_ID) {
        msg = 'CHAIN: ' + objParams.CHAIN_ID;
      } else if ('' + objParams?.PROCESS_ID) {
        msg = ' PROCESS: ' + objParams?.PROCESS_ID;
      }
      throw new Error(`Interpreter: ${msg}: ${err} IN: ${inputObject}`);
    }
  }
}
