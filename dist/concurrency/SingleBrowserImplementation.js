"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConcurrencyImplementation_1 = require("./ConcurrencyImplementation");
const util_1 = require("../util");
const debug = util_1.debugGenerator('SingleBrowserImpl');
const BROWSER_TIMEOUT = 5000;
class SingleBrowserImplementation extends ConcurrencyImplementation_1.default {
    constructor(options, puppeteer) {
        super(options, puppeteer);
        this.browser = null;
        this.repairing = false;
        this.repairRequested = false;
        this.openInstances = 0;
        this.waitingForRepairResolvers = [];
    }
    repair() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openInstances !== 0 || this.repairing) {
                // already repairing or there are still pages open? wait for start/finish
                yield new Promise(resolve => this.waitingForRepairResolvers.push(resolve));
                return;
            }
            this.repairing = true;
            debug('Starting repair');
            try {
                // will probably fail, but just in case the repair was not necessary
                yield this.browser.close();
            }
            catch (e) {
                debug('Unable to close browser.');
            }
            try {
                this.browser = (yield this.puppeteer.launch(this.options));
            }
            catch (err) {
                throw new Error('Unable to restart chrome.');
            }
            this.repairRequested = false;
            this.repairing = false;
            this.waitingForRepairResolvers.forEach(resolve => resolve(undefined));
            this.waitingForRepairResolvers = [];
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield this.puppeteer.launch(this.options);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.browser.close();
        });
    }
    workerInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            let resources;
            return {
                jobInstance: () => __awaiter(this, void 0, void 0, function* () {
                    if (this.repairRequested) {
                        yield this.repair();
                    }
                    yield util_1.timeoutExecute(BROWSER_TIMEOUT, (() => __awaiter(this, void 0, void 0, function* () {
                        resources = yield this.createResources();
                    }))());
                    this.openInstances += 1;
                    return {
                        resources,
                        close: () => __awaiter(this, void 0, void 0, function* () {
                            this.openInstances -= 1; // decrement first in case of error
                            yield util_1.timeoutExecute(BROWSER_TIMEOUT, this.freeResources(resources));
                            if (this.repairRequested) {
                                yield this.repair();
                            }
                        }),
                    };
                }),
                close: () => __awaiter(this, void 0, void 0, function* () { }),
                repair: () => __awaiter(this, void 0, void 0, function* () {
                    debug('Repair requested');
                    this.repairRequested = true;
                    yield this.repair();
                }),
            };
        });
    }
}
exports.default = SingleBrowserImplementation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2luZ2xlQnJvd3NlckltcGxlbWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmN1cnJlbmN5L1NpbmdsZUJyb3dzZXJJbXBsZW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLDJFQUFzRjtBQUV0RixrQ0FBeUQ7QUFDekQsTUFBTSxLQUFLLEdBQUcscUJBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRWxELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQztBQUU3QixNQUE4QiwyQkFBNEIsU0FBUSxtQ0FBeUI7SUFTdkYsWUFBbUIsT0FBZ0MsRUFBRSxTQUFjO1FBQy9ELEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFScEIsWUFBTyxHQUE2QixJQUFJLENBQUM7UUFFM0MsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUMzQixvQkFBZSxHQUFZLEtBQUssQ0FBQztRQUNqQyxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUMxQiw4QkFBeUIsR0FBaUMsRUFBRSxDQUFDO0lBSXJFLENBQUM7SUFFYSxNQUFNOztZQUNoQixJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQzVDLHlFQUF5RTtnQkFDekUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDM0UsT0FBTzthQUNWO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFekIsSUFBSTtnQkFDQSxvRUFBb0U7Z0JBQ3BFLE1BQTBCLElBQUksQ0FBQyxPQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDbkQ7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUk7Z0JBQ0EsSUFBSSxDQUFDLE9BQU8sSUFBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQXNCLENBQUEsQ0FBQzthQUNqRjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNWLE1BQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQzthQUNoRDtZQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMseUJBQXlCLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLENBQUM7S0FBQTtJQUVZLElBQUk7O1lBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO0tBQUE7SUFFWSxLQUFLOztZQUNkLE1BQU8sSUFBSSxDQUFDLE9BQTZCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEQsQ0FBQztLQUFBO0lBTVksY0FBYzs7WUFDdkIsSUFBSSxTQUF1QixDQUFDO1lBRTVCLE9BQU87Z0JBQ0gsV0FBVyxFQUFFLEdBQVMsRUFBRTtvQkFDcEIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO3dCQUN0QixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztxQkFDdkI7b0JBRUQsTUFBTSxxQkFBYyxDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQVMsRUFBRTt3QkFDOUMsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUM3QyxDQUFDLENBQUEsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDTixJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQztvQkFFeEIsT0FBTzt3QkFDSCxTQUFTO3dCQUVULEtBQUssRUFBRSxHQUFTLEVBQUU7NEJBQ2QsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsQ0FBQyxtQ0FBbUM7NEJBQzVELE1BQU0scUJBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzRCQUVyRSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0NBQ3RCLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOzZCQUN2Qjt3QkFDTCxDQUFDLENBQUE7cUJBQ0osQ0FBQztnQkFDTixDQUFDLENBQUE7Z0JBRUQsS0FBSyxFQUFFLEdBQVMsRUFBRSxnREFBRSxDQUFDLENBQUE7Z0JBRXJCLE1BQU0sRUFBRSxHQUFTLEVBQUU7b0JBQ2YsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO29CQUM1QixNQUFNLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQyxDQUFBO2FBQ0osQ0FBQztRQUNOLENBQUM7S0FBQTtDQUNKO0FBMUZELDhDQTBGQyJ9