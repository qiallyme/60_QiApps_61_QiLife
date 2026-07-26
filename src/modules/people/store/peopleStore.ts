import { FakeGoogleContactsGateway, type GoogleContactsGateway } from "../services/googleContactsGateway";
import { QiLifePeopleRepository, type PeopleRepository } from "../services/peopleRepository";

let activeRepository: PeopleRepository = new QiLifePeopleRepository();
let activeGoogleGateway: GoogleContactsGateway = new FakeGoogleContactsGateway();

export function getPeopleRepository(): PeopleRepository {
  return activeRepository;
}

export function setPeopleRepository(repo: PeopleRepository): void {
  activeRepository = repo;
}

export function getGoogleContactsGateway(): GoogleContactsGateway {
  return activeGoogleGateway;
}

export function setGoogleContactsGateway(gateway: GoogleContactsGateway): void {
  activeGoogleGateway = gateway;
}
