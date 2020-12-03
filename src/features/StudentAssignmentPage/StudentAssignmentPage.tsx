import { getAmy } from "@amy-app/amy-app-js-sdk";
import {
    FeedbackRow,
    InstructionRow,
    OptionRow,
    StudentAssignment,
} from "@amy-app/amy-app-js-sdk/dist/src/StudentAssignment";
import { Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ExpressionRender, InstructionRender } from "../../components/amy-render/DefaultRenderer";
import { useAmyReady } from "../../tools/amyHooks";

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
                <InstructionRender text={inst} />
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
                        <ExpressionRender text={o?.text} />
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
                        <ExpressionRender text={o?.text} />
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
                                <ExpressionRender text={o?.text} />
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>
        );
    }

    return null;
}

export default function StudentAssignmentPage() {
    const ready = useAmyReady(getAmy());
    const { studentAssignmentId } = useParams<{ studentAssignmentId: string }>();
    const [studentAssignment, setStudentAssignment] = useState<StudentAssignment>();

    useEffect(() => {
        if (studentAssignmentId && ready) {
            getAmy().studentAssignmentObserver(studentAssignmentId, (_studentAssignment) => {
                setStudentAssignment(_studentAssignment);
            });
        }
    }, [studentAssignmentId, ready]);

    if (!ready || !studentAssignment) {
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
