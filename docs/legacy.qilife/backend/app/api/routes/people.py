from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.models import Person
from app.db.session import get_session

router = APIRouter()


class PersonCreateRequest(BaseModel):
    display_name: str
    legal_name: str
    type: str = "person"
    relationship: str = ""
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    notes: str | None = None


@router.get("")
def list_people(session: Session = Depends(get_session)) -> list[Person]:
    return session.exec(select(Person).order_by(Person.display_name)).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_person(payload: PersonCreateRequest, session: Session = Depends(get_session)) -> Person:
    person = Person(**payload.model_dump())
    session.add(person)
    session.commit()
    session.refresh(person)
    return person


@router.get("/{person_id}")
def get_person(person_id: str, session: Session = Depends(get_session)) -> Person:
    person = session.get(Person, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return person
