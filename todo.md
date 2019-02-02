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

    + prepare
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
        + nullAsEmpty
        + nullAsZero
        + nullAsFalse
        + round
        + floor
        + ceil
        + redefine standard prepares
    
    + event change
        + event "change:prop"

    - arr property
        + key: ["number"]
        + key: ["string"]
        - key: ["boolean"]
        - key: ["date"]
        - key: [ChildModel]
        - key: [{type: "string", trim: true, ...}]
        + emptyAsNull
        + nullAsEmpty
        - unique
        ...
    
    - obj property
        - prop: {key: "number"}
        - prop: {key: {type: "number", round: 2, ...}}
        ...

    + child model
        + walk
        + findChild
        + filterChildren
        + findParent
        + filterParents
        + findParentInstance

    - compile (first constructor call must replace methods)
    + hasValue
    + hasProperty
    + toJSON
        - child models

    - custom types
    - method equal
    
- Collection
    - serial
    - primary key
    - unique
    - foreign key

- locale errors