- Model
    + default
        + default primitive
        + default as func
    
    - validate structure

    + const values

    + validate
        + required
        + validate data object
        + validate field
        + validate field by regexp
        + enum
        + isValid

    - prepare
        + custom prepare data
        + custom prepare field
        + prepare boolean
        + prepare number
        + prepare string
        + prepare date
        + trim
        + lower
        + upper
        + emptyAsNull
        + zeroAsNull
        + falseAsNull
        + round
        + floor
        + ceil
    
    + event change
        + event "change:prop"

    - child model
    - walk
    - compile (first constructor call must replace methods)
    + hasValue
    + hasProperty
    + toJSON
        - child models

- Collection
    - serial
    - primary key
    - unique
    - foreign key

- locale errors