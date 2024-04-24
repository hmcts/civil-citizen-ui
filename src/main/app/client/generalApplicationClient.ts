
import Axios, {AxiosInstance} from 'axios';
import {AppRequest} from "models/AppRequest";
import {
    CIVIL_GENERAL_APPLICATIONS_SUBMIT_EVENT
} from './generalApplicationUrls';
import {CaseEvent} from "models/generalApplication/events/caseEvent";
import {ApplicationUpdate, EventDto} from "models/generalApplication/events/eventDto";
import {Application} from "models/generalApplication/application";
import {AssertionError} from "assert";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('generalApplicationClient');

export class GeneralApplicationClient {
    client: AxiosInstance;

    constructor(baseURL: string, isDocumentInstance?: boolean) {
        if (isDocumentInstance) {
            this.client = Axios.create({
                baseURL,
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
            });
        } else {
            this.client = Axios.create({
                baseURL,
            });
        }
    }

    getConfig(req: AppRequest) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.session?.user?.accessToken}`,
            },
        };
    }

    async retrieveApplicationDetails(claimId: string, req: AppRequest): Promise<Application> {
        const config = this.getConfig(req);
        try {
            const response = await this.client.get(`/cases/${claimId}`, config);// nosonar
            if (!response.data) {
                throw new AssertionError({message: 'Claim details not available!'});
            }
            const caseDetails: Application = response.data;
            return caseDetails;
        } catch (err: unknown) {
            logger.error('Error when retrieving claim details');
            throw err;
        }
    }

    async submitEvent(event: CaseEvent, claimId: string, updatedClaim?: ApplicationUpdate, req?: AppRequest): Promise<Application> {
        const config = this.getConfig(req);
        const userId = req.session?.user?.id;
        const data: EventDto = {
            event: event,
            caseDataUpdate: updatedClaim,
        };
        try {
            const response = await this.client.post(CIVIL_GENERAL_APPLICATIONS_SUBMIT_EVENT // nosonar
                .replace(':submitterId', userId)
                .replace(':caseId', claimId), data, config);// nosonar
            const application = response.data as Application;
            return application;
        } catch (err: unknown) {
            logger.error(`Error when submitting event ${event}`);
            throw err;
        }
    }
}