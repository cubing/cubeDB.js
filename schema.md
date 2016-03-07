# CubeDB

## Typedefs

    SessionName := string

    Date := int // Unix date

    EventName := string enum
      ["333", "333bf", etc.]

    ScrambleString := String

    Centiseconds := int

    ResultFormats := string enum
      ["Centiseconds", "MoveCount", ...]

    Event := {
      // implicit: string EventName
      resultFormat := ResultFormatName
    }

    UUID := string // 16 alphanumeric chars: [A-Za-z0-9]{16}

    Events = {EventName -> Event}

    // A type for keeping track of records without iterating over the entire database.
    // RecordData = {
    //   // best avg5, etc?
    // }

## IndexedDB "schema"

### `sessions`

    sessions := [{
      name := SessionName [primary key, unique]
      id := UUID [indexed]
      // cache date of first and last solve?
    }]

### `attempts`

    attempts := [{
      // Metadata
      date := Date [indexed] // Date of end of the solve.
      event := EventName [indexed]
      session := SessionName [indexed]
      id := UUID
      scramble := ScrambleString

      // Result data
      [optional] resultCentiseconds := Centiseconds [indexed]
      // [optional] resultMoveCount := MoveCount [indexed] // Future possibility

    }]

### preferences

    preferences := [{
      appId := string // e.g. "net.cubing.timer"
      // encourage versioning?

      // Individual entries up the app.
    }]

## Future

- Compress scrambles?
- Handle deleted attempts
  - Sepatate table for deleted attempts + last modified date for each attempt? (present if modifed since original date)
  - Operational transforms?
- Penalties/DNF
- Allow common preferences to be unified across apps?
