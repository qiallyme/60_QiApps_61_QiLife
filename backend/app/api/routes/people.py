from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.models import Person
from app.db.session import get_session

router = APIRouter()


@router.get("")
def list_people(session: Session = Depends(get_session)) -> list[Person]:
    return session.exec(select(Person).order_by(Person.display_name)).all()


@router.get("/{person_id}")
def get_person(person_id: str, session: Session = Depends(get_session)) -> Person:
    person = session.get(Person, person_id)
    if person is None:
        raise HTTPException(status_code=404, detail="Person not found")
    return person
