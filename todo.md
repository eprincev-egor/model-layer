+ Model
    + default
        + default primitive
        + default as func
    
    + validate structure

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

    + arr property
        + key: ["number"]
        + key: ["string"]
        + key: ["boolean"]
        + key: ["date"]
        + key: [ChildModel]
        + array of arrays
        + key: [{type: "string", trim: true, ...}]
        + emptyAsNull
        + nullAsEmpty
        + unique
        + sort
        + sort by custom comparator
    
    + obj property
        + prop: {element: "number"}
        + prop: {element: {type: "number", round: 2, ...}}
        + emptyAsNull
        + nullAsEmpty
        ...

    + child model
        + walk
            + array of models
            - object of models
        + findChild
        + filterChildren
        + findParent
        + filterParents
        + findParentInstance

    - compile (first constructor call must replace methods)
    + hasValue
    + hasProperty
    + toJSON
        + child models

    + custom types
    + method equal
    + method clone
    + primary key
      (fast link model.id)
    
- Collection
    array methods:
        - modelBy
        + at
        
        events:
            + add
            - change
            - remove


        array methods:
            + push
            + forEach, each
            + splice
            + find
            + findIndex
            + indexOf
            + concat
            + filter
            + includes
            + map
            + sort
            + reduce
            + pop
            + shift
            + unshift
            + every
            + some
            + slice
            + fill
            + flat
            + flatMap
            + join
            + lastIndexOf
            + reduceRight
            + reverse
            + first
            + last
            + reset
            + add
            + create
            + toJSON
            + remove by model instance
                - remove by id
            - get by id

            - node8+ polyfill

    constraints:
        - serial
        - primary key
        - unique
        - foreign key

- locale errors