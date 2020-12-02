import { amyConfigs, initializeAmy } from "@amy-app/amy-app-js-sdk";
import { Amy } from "@amy-app/amy-app-js-sdk/dist/src/Amy";
import {
    FeedbackRow,
    InstructionRow,
    OptionRow,
    StudentAssignment,
} from "@amy-app/amy-app-js-sdk/dist/src/StudentAssignment";
import { Button, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "firebase";
import { default as React, useEffect, useState } from "react";

const useStyles = makeStyles((theme) => ({
    instruction: {
        backgroundColor: "white",
        borderLeft: "8px solid #3f51b5",
        border: "1px solid #3f51b5",
        borderRadius: "4px",
    },
    correctOption: {
        backgroundColor: "white",
        borderLeft: "8px solid #3fb540",
        border: "1px solid #3fb540",
        borderRadius: "4px",
    },
    incorrectOption: {
        backgroundColor: "white",
        borderLeft: "8px solid #b53f3f",
        border: "1px solid #b53f3f",
        borderRadius: "4px",
    },
    unknownOption: {
        backgroundColor: "white",
        borderLeft: "8px solid #b5b5b5",
        border: "1px solid #b5b5b5",
        borderRadius: "4px",
    },
}));

export function Instruction({ inst }: { inst: string }) {
    const classes = useStyles();
    return (
        <Grid container spacing={1} justify="flex-end" className={classes.instruction}>
            <Grid item xs={12}>
                <Typography variant="body1">{inst}</Typography>
            </Grid>
        </Grid>
    );
}

export function Option({ optionRow }: { optionRow: OptionRow }) {
    const classes = useStyles();
    if (optionRow.correct === "YES") {
        const o = optionRow.options.find((e) => e.selected);

        return (
            <Grid container spacing={1} justify="flex-end" className={classes.correctOption}>
                <Grid item xs={12}>
                    <Button disabled fullWidth={true}>
                        {o?.text}
                    </Button>
                </Grid>
            </Grid>
        );
    }

    if (optionRow.correct === "NO") {
        const o = optionRow.options.find((e) => e.selected);
        return (
            <Grid container spacing={1} justify="flex-end" className={classes.incorrectOption}>
                <Grid item xs={12}>
                    <Button disabled fullWidth={true}>
                        {o?.text}
                    </Button>
                </Grid>
            </Grid>
        );
    }

    if (optionRow.correct === "UNKNOWN") {
        return (
            <Grid container spacing={1} justify="flex-end" className={classes.unknownOption}>
                {optionRow.options.map((o) => {
                    return (
                        <Grid item xs={12} key={o.id}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    o.select();
                                }}
                            >
                                {o.text}
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>
        );
    }

    return null;
}

let amy: Amy;
let firebaseApp: firebase.app.App;

if (firebase.apps.length === 0) {
    firebaseApp = firebase.initializeApp(amyConfigs, "amy.app");
} else {
    firebaseApp = firebase.app("amy.app");
}

// if (firebase.apps.length === 0) {
//     firebaseApp = firebase.initializeApp(amyConfigs, "amy.app");
//     console.log("app name", firebaseApp.name);
//     amy = initializeAmy({ firebaseApp });

//     amy.readyObserver((ready) => {
//         console.log("app name", firebaseApp.name);
//         console.log("ready", ready);
//     });

//     // amy.signInViaToken(
//     //     "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTYwNjgxMTg3NywiZXhwIjoxNjA2ODE1NDc3LCJpc3MiOiJhbXktLWFwcEBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJzdWIiOiJhbXktLWFwcEBhcHBzcG90LmdzZXJ2aWNlYWNjb3VudC5jb20iLCJ1aWQiOiJKYWlwdW5hX2RlbW8xX2RlbW9TdHVkZW50MSIsImNsYWltcyI6eyJzY2hvb2xJZCI6IkphaXB1bmFfZGVtbzEiLCJyb2xlIjoic3R1ZGVudCJ9fQ.Pg734O_ph7ThjqJ9rzuCFMBw4rwxr3mMBOeFnS0l8_zr6r5aUDE8pnq2v9-HotbFngjv0nmXb3RnBe9PWsdxYIytBEwe_2IDY5FzpbW-ClV_DwBGLHtoKH-lPBCUKHcNvAPhyz0VUT7rlz9V8ST10wfbhDIeWLzZKMOeVTffIjyp5LK3Bv1SfgujGz5flFGKrrzcjMc3Ia26NSL2F5ADP90XMYhYiy0HCZLEYNZYUYGXyeMILWHUV_-FhGoklhaMRxtcjhGwOcsqX1LuzPUAoRIH6wvWL2X_c_OGkjQ9T2PguYWuhHSuk-sThEg6WGroddnvs8FBq2LPhNbmHopSbA",
//     // );
// }

amy = initializeAmy({ firebaseApp });

export default function StudentAssignmentPage() {
    const [ready, setReady] = useState(false);
    const [studentAssignmentId, setStudentAssignmentId] = useState("");
    const [studentAssignment, setStudentAssignment] = useState<StudentAssignment>();

    useEffect(() => {
        amy.readyObserver((_ready) => setReady(_ready));
    });

    useEffect(() => {
        if (studentAssignmentId) {
            console.log("ass id", studentAssignmentId);
            amy.studentAssignmentObserver(studentAssignmentId, (_studentAssignment) => {
                setStudentAssignment(_studentAssignment);
            });
        }
    }, [studentAssignmentId]);

    if (!ready) {
        return <>Waiting...</>;
    }

    if (!studentAssignmentId) {
        return (
            <>
                <Button
                    onClick={() => {
                        amy.startAssignment(["DECI00001"]).then((_studentAssignmentId) => {
                            setStudentAssignmentId(_studentAssignmentId);
                        });
                    }}
                >
                    Start
                </Button>
            </>
        );
    }

    if (!studentAssignment) {
        return <>Waiting...</>;
    }

    const bubbles = [];
    const exercise = studentAssignment.getFirstUnfinishedExercise();
    if (!exercise) {
        return <>Done</>;
    }

    for (const row of exercise.rows) {
        if (row instanceof InstructionRow) {
            bubbles.push(
                <Grid item xs={8} key={row.id}>
                    <Instruction inst={row.text} />
                </Grid>,
            );
        }

        if (row instanceof FeedbackRow) {
            bubbles.push(
                <Grid item xs={8} key={row.id}>
                    <Instruction inst={row.text} />
                </Grid>,
            );
        }

        if (row instanceof OptionRow) {
            bubbles.push(
                <Grid item xs={8} key={row.id}>
                    <Option optionRow={row} />
                </Grid>,
            );
        }
    }

    return (
        <Grid container xs={12} spacing={2} alignItems="center" justify="center">
            {bubbles}
        </Grid>
    );
}
