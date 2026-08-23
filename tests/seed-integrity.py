import re,csv,io,pathlib,sys
p=(pathlib.Path(__file__).parents[1]/'supabase'/'schema_and_seed.sql').read_text()
rows=re.findall(r"^  \('m[^\n]+\)(?:,|$)",p,re.M)
ids=[]; bad=[]
for row in rows:
    inner=row.strip().rstrip(',')[1:-1]
    vals=next(csv.reader(io.StringIO(inner),delimiter=',',quotechar="'",skipinitialspace=True))
    ids.append(vals[0]); venue=vals[9]; gf=int(vals[10]); gc=int(vals[11]); ls=int(vals[17]); vs=int(vals[18])
    if not ((venue=='home' and ls==gf and vs==gc) or (venue=='away' and ls==gc and vs==gf)):
        bad.append((vals[0],venue,gf,gc,ls,vs))
assert len(rows)==106, f'Expected 106 seed matches, got {len(rows)}'
assert len(set(ids))==106, 'Duplicate seed IDs found'
assert not bad, f'Score consistency errors: {bad[:5]}'
print('PASS seed integrity: 106 unique matches, 0 score consistency violations')
