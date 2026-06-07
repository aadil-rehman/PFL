import { FIELD, LABEL, PRIMARY_BTN } from '../../ui/formStyles'

export default function DetailsStep({ details, setDetails, onSubmit, loading, error }) {
  const set = (key) => (e) =>
    setDetails((d) => ({ ...d, [key]: e.target.value }))

  const valid =
    details.name.trim() &&
    details.state.trim() &&
    details.district.trim() &&
    details.address.trim()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <p className="text-sm text-white/60">
        Looks like you're new here. Tell us a little about yourself to finish
        setting up your account.
      </p>

      <div>
        <label className={LABEL}>Full Name</label>
        <input
          autoFocus
          value={details.name}
          onChange={set('name')}
          placeholder="Rahul Sharma"
          className={FIELD}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>State</label>
          <input
            value={details.state}
            onChange={set('state')}
            placeholder="Uttar Pradesh"
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>District</label>
          <input
            value={details.district}
            onChange={set('district')}
            placeholder="Ghaziabad"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Address</label>
        <input
          value={details.address}
          onChange={set('address')}
          placeholder="Loni, near…"
          className={FIELD}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={!valid || loading} className={PRIMARY_BTN}>
        {loading ? 'Creating…' : 'Create Account & Continue'}
      </button>
    </form>
  )
}
