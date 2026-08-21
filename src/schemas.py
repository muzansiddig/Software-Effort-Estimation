from pydantic import BaseModel, Field
from typing import Literal


class ProjectInput(BaseModel):

    # -----------------------------
    # Project Information
    # -----------------------------

    projectname: Literal[
        "de",
        "erb",
        "gal",
        "X",
        "hst",
        "slp",
        "Y",
        "spl"
    ]

    cat2: Literal[
        "avionicsmonitoring",
        "missionplanning",
        "simulation",
        "monitor_control",
        "realdataprocessing",
        "communications",
        "batchdataprocessing",
        "datacapture",
        "launchprocessing",
        "application_ground",
        "utility",
        "operatingsystem",
        "Avionics",
        "science"
    ]

    forg: Literal["g", "f"]

    center: Literal[
        "1",
        "2",
        "3",
        "5",
        "6"
    ]

    year: int = Field(
        ge=1970,
        le=2030
    )

    mode: Literal[
        "organic",
        "semidetached",
        "embedded"
    ]

    # -----------------------------
    # Cost Drivers
    # -----------------------------

    rely: Literal["vl", "l", "n", "h", "vh"]

    data: Literal["l", "n", "h", "vh"]

    cplx: Literal["vl", "l", "n", "h", "vh", "xh"]

    time: Literal["n", "h", "vh", "xh"]

    stor: Literal["n", "h", "vh", "xh"]

    virt: Literal["l", "n", "h"]

    turn: Literal["l", "n", "h", "vh"]

    acap: Literal["n", "h", "vh"]

    aexp: Literal["l", "n", "h"]

    pcap: Literal["l", "n", "h", "vh"]

    vexp: Literal["l", "n"]

    lexp: Literal["l", "n", "h"]

    modp: Literal["l", "n", "h", "vh"]

    tool: Literal["l", "n", "h", "vh"]

    sced: Literal["vl", "l", "n", "h"]

    equivphyskloc: float = Field(
        description="Equivalent physical KLOC"
    )
