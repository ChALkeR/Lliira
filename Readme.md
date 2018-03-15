# Lliira

Organize the best timeslots for a meeting based on probability scores.

📝✨💃

## Input format

Input is a [tsv][] file (for easier copy-pasting from spreadsheets).
If input file is not specified, `data.tsv` is used by default.

Each row stands for one participant preferences, each column stands a single timeslot.

Rows could be prefixed with names.

### Default scores definition

 * `0` — Impossible, ~0%.
 * `1` — Bad, <50%, or going to be late or leave early every time.
 * `2` — Inconvenvient, ≥50%.
 * `3` — Tolerable, ≥80%.
 * `4` — Good, ~100%, perhaps with only minor inconvenience.
 * `5` — Perfect, ~100%.

### Example input file

```tsv
Alice	4	5	0	0	5	2
John	4	5	5	4	2	5
Maddy	3	2	5	0	4	4
Mike	1	0	3	5	5	4
Peter	5	5	3	1	2	2
```

Names are optional, generic names are used if only numbers are present in the input.

## Output format

This tool is not ideal — it does not select one magic timeslot or a magic combination to use.
Instead, it ranks each possible attempt using several metrics, and outputs a set of several
optimal combinations for different utility function balances.

After that you can select the one combination you see better fit (based of metrics).

For maximum number of meetings equal to three (default), there should normally be about 10 entries
in the output or less.

Timeslots are numbered from `0`.

### Example output

```js
times: [ 4 ], participation: { avg: 0.7357, min: 0.479, stdev: 0.2096, fair: 0.8255 }, interaction: { avg: 0.5536, min: 0.2395, stdev: 0.2092, fair: 0.6655 }
times: [ 0 ], participation: { avg: 0.7415, min: 0.1936, stdev: 0.2792, fair: 0.5673 }, interaction: { avg: 0.5478, min: 0.1549, stdev: 0.3082, fair: 0.4745 }
times: [ 5 ], participation: { avg: 0.7317, min: 0.4776, stdev: 0.2075, fair: 0.8244 }, interaction: { avg: 0.5492, min: 0.2388, stdev: 0.2065, fair: 0.6644 }
times: [ 0, 4 ], participation: { avg: 0.7386, min: 0.5518, stdev: 0.1245, fair: 0.9678 }, interaction: { avg: 0.5507, min: 0.3185, stdev: 0.1394, fair: 0.725 }
times: [ 4, 5 ], participation: { avg: 0.7337, min: 0.4783, stdev: 0.158, fair: 0.8476 }, interaction: { avg: 0.5514, min: 0.3466, stdev: 0.1563, fair: 0.7372 }
times: [ 0, 2, 4 ], participation: { avg: 0.7103, min: 0.6128, stdev: 0.0904, fair: 0.9688 }, interaction: { avg: 0.5111, min: 0.3538, stdev: 0.1004, fair: 0.8261 }
times: [ 0, 4, 5 ], participation: { avg: 0.7363, min: 0.6254, stdev: 0.0819, fair: 0.9655 }, interaction: { avg: 0.5502, min: 0.3626, stdev: 0.09, fair: 0.7937 }
times: [ 0, 3, 4 ], participation: { avg: 0.5219, min: 0.4337, stdev: 0.0607, fair: 0.9193 }, interaction: { avg: 0.3765, min: 0.2261, stdev: 0.0817, fair: 0.6501 }
times: [ 1, 4, 5 ], participation: { avg: 0.6973, min: 0.6088, stdev: 0.0708, fair: 0.9527 }, interaction: { avg: 0.4973, min: 0.3072, stdev: 0.0845, fair: 0.7563 }
times: [ 0, 4, 4 ], participation: { avg: 0.7376, min: 0.6226, stdev: 0.122, fair: 0.9585 }, interaction: { avg: 0.5516, min: 0.364, stdev: 0.1283, fair: 0.7653 }
```

Of that, `[ 4 ]` looks like the most tolerable time for a single meeting, and `[ 0, 4, 5 ]` looks to be
a decent choice for rotating recurrent meetings. 

### Metrics

#### Metric groups

* `participation` is an analysis of participation probabilites.
  It is done per-person and measures the distribution of number of meetings visited by a person.

* `interaction` is an analysis of interaction probabilites.
  It is done per each unique pair of participats and analyzes the distribution of number of times
  that interaction happened.

#### Group scores

* `avg` is an average number for all entries divided by the theoretical maximum.
  * `min.participation` is equal to the chance for an average paricipation to happen in an average
    meeting.
  * `min.interaction` is equal to the chance for an average interaction to happen in an average
    meeting.

* `min` is the average number for the least represented entry.
  * `min.participation` is equal to the chance that the least represented participant will
    participate in an average meeting.
  * `min.interaction` is equal to the chance that the least overall probable interaction will happen
    in an average meeting.

* `stdev` is a population [standard deviation][] over a set of average numbers for each entry.
  The lower `stdev` is, the more equal each entry is represented (i.e. all are equally good or bad).

* `fair` is a non-linear metric that first tries to optimize the amount of entries that are
  represented at least onece, then amount of entries that are represented twice, and so on.

Scale for `avg`, `min`, and `fair` is `0,1`, scale for `stdev` is `0,0.5`.

Good numbers for `avg`, `min`, and `fair` are the higher ones, good numbers for `stdev` are the
smaller ones.

## Default parameters

Parameters are bundled in `config.js`.

Default maximum number of meeting slots that could be rotated is equal to `3` — that means that each
row will present at much 3 time slots to rotate between those (for regular meetings).

Default probability values for scores are `[0.02, 0.2, 0.5, 0.8, 0.94, 0.95]`.  
That never reaches `0` and `1` on a purpose — those are not real-world probabilites.
So `0` is not always 0% and `5` can not mean 100% attendance — unexpected things happen.

[tsv]: https://en.wikipedia.org/wiki/Tab-separated_values
[standard deviation]: https://en.wikipedia.org/wiki/Standard_deviation
