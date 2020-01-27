"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const killer_1 = require("./killer");
function killPortProcess(input, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const validInput = helpers_1.IsInputValid(input);
            if (!validInput) {
                throw new helpers_1.InvalidInputError('Invalid input', input);
            }
            const mergedOptions = helpers_1.mergeOptions(options);
            const toNumber = (value) => Number(value);
            const ports = helpers_1.arrayifyInput(input).map(toNumber);
            const killer = new killer_1.Killer(ports, mergedOptions);
            yield killer.kill();
        }
        catch (error) {
            throw error;
        }
    });
}
exports.killPortProcess = killPortProcess;
