import { ObjectId } from 'mongodb';
import { getDb, hasDb } from './db.js';
import { CATEGORIES, defaultProjects } from './default-projects.js';

const CAT_IDS = CATEGORIES.map(([id]) => id);

const clean = doc => ({
  id: String(doc._id),
  category: doc.category,
  name: doc.name,
  description: doc.description,
  tags: doc.tags || [],
  url: doc.url || '',
  repo: doc.repo || '',
  image: doc.image || '',
  order: doc.order ?? 0,
});

const staticList = () =>
  defaultProjects.map((p, i) => ({
    ...p,
    id: `s${i}`,
    repo: '',
    image: '',
    order: i,
  }));

async function isSeeded(db) {
  return Boolean(
    await db.collection('meta').findOne({ _id: 'projects-seeded' }),
  );
}

/* Public site: DB e project thakle seta, na hole built-in list. DB error hole built-in. */
export async function getPublicProjects() {
  if (!hasDb()) return staticList();
  try {
    const db = await getDb();
    if (!(await isSeeded(db))) return staticList();
    const docs = await db
      .collection('projects')
      .find({})
      .sort({ order: 1, _id: 1 })
      .toArray();
    return docs.map(clean);
  } catch (error) {
    console.error(
      '[projects] DB read failed, using built-in list:',
      error.message,
    );
    return staticList();
  }
}

/* Admin: prothom bar ager 5 ta project DB te import kore dey, jate edit/delete kora jay. */
export async function listAdminProjects() {
  const db = await getDb();
  if (!(await isSeeded(db))) {
    const count = await db.collection('projects').countDocuments();
    if (count === 0) {
      await db
        .collection('projects')
        .insertMany(
          defaultProjects.map((p, i) => ({
            ...p,
            repo: '',
            image: '',
            order: i,
            createdAt: new Date(),
          })),
        );
    }
    await db
      .collection('meta')
      .updateOne(
        { _id: 'projects-seeded' },
        { $set: { at: new Date() } },
        { upsert: true },
      );
  }
  const docs = await db
    .collection('projects')
    .find({})
    .sort({ order: 1, _id: 1 })
    .toArray();
  return docs.map(clean);
}

const isHttp = value => /^https?:\/\/[^\s]+$/i.test(value);
const isImage = value =>
  /^\/api\/img\/[a-f0-9]{24}$/i.test(value) || isHttp(value);

export function validateProject(body) {
  const category = String(body.category || '');
  const name = String(body.name || '').trim();
  const description = String(body.description || '').trim();
  const url = String(body.url || '').trim();
  const repo = String(body.repo || '').trim();
  const image = String(body.image || '').trim();
  const tags = (
    Array.isArray(body.tags) ? body.tags : String(body.tags || '').split(',')
  )
    .map(t => String(t).trim())
    .filter(Boolean)
    .slice(0, 8);

  if (!CAT_IDS.includes(category)) return { error: 'Choose a category.' };
  if (!name || name.length > 80)
    return { error: 'Name is required (max 80 chars).' };
  if (!description || description.length > 400)
    return { error: 'Description is required (max 400 chars).' };
  if (url && !isHttp(url))
    return { error: 'Live link must start with http:// or https://' };
  if (repo && !isHttp(repo))
    return { error: 'GitHub link must start with http:// or https://' };
  if (image && !isImage(image)) return { error: 'Invalid image.' };
  if (tags.some(t => t.length > 24))
    return { error: 'Each tag must be under 24 chars.' };
  return { value: { category, name, description, url, repo, image, tags } };
}

export async function createProject(value) {
  await listAdminProjects(); // seed age kore nei
  const db = await getDb();
  const first = await db
    .collection('projects')
    .find({})
    .sort({ order: 1 })
    .limit(1)
    .toArray();
  const order = first.length ? (first[0].order ?? 0) - 1 : 0; // notun project shobar age
  const result = await db
    .collection('projects')
    .insertOne({ ...value, order, createdAt: new Date() });
  return String(result.insertedId);
}

export async function updateProject(id, value) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const result = await db
    .collection('projects')
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...value, updatedAt: new Date() } },
    );
  return result.matchedCount > 0;
}

export async function deleteProject(id) {
  if (!ObjectId.isValid(id)) return false;
  const db = await getDb();
  const doc = await db
    .collection('projects')
    .findOneAndDelete({ _id: new ObjectId(id) });
  const image = doc?.image || doc?.value?.image;
  const match = /^\/api\/img\/([a-f0-9]{24})$/i.exec(image || '');
  if (match)
    await db.collection('images').deleteOne({ _id: new ObjectId(match[1]) });
  return Boolean(doc);
}
