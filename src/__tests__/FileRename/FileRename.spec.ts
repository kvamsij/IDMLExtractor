import FileRename from '@src/core/usecase/FileRename/FileRename';

import { existsSync, rmSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

type FileRenameResults = Promise<{ message: string } | { error: string } | undefined>;
const SUCCESS_MSG = 'Successfully renamed file';

beforeAll(async () => {
  await mkdir(`${tmpdir()}/FakeFolder/test`, { recursive: true });
  await writeFile(`${tmpdir()}/FakeFolder/fake.idml`, 'Sample test for fake idml file');
});

afterAll(() => {
  rmSync(`${tmpdir()}/FakeFolder`, { recursive: true });
});

beforeEach(async () => {
  if (!existsSync(`${tmpdir()}/FakeFolder/fake.idml`))
    await writeFile(`${tmpdir()}/FakeFolder/fake.idml`, 'Sample test for fake idml file');
  jest.clearAllMocks();
});

describe('FileRename', () => {
  FileRenameClassInitializerTest();
  FileRenameErrorsTest();
  FileRenameClassImplementationTest();
});

function FileRenameClassImplementationTest() {
  describe('FileRename Implementation', () => {
    it('should rename filename with .zip as extension', async () => {
      const fileRename = new FileRename(`${tmpdir()}/FakeFolder/fake.idml`);
      await fileRename.fsRename();
      const isZipExists = existsSync(`${tmpdir()}/FakeFolder/test/fake.zip`);
      expect(isZipExists).toBeTruthy();
    });

    it('should called with given file path', async () => {
      const sourcePath = path.join(`${tmpdir()}`, 'FakeFolder', 'fake.idml');
      const fileRename = new FileRename(sourcePath);
      try {
        await fileRename.fsRename();
      } catch {
        // ignore errors
      } finally {
        expect(fileRename).toMatchObject({
          sourcePath,
        });
      }
    });
  });
}

function FileRenameErrorsTest() {
  describe('FileRename Errors', () => {
    it('should throw an error if the filePath does not exists', async () => {
      const fileRename = new FileRename('./example.idml');
      const response = await fileRename.fsRename();
      expect(response).toMatchObject({ error: 'File Not Found' });
    });

    it('should throw an error if the given file extension is not .idml', async () => {
      const fakeTextFile = `${tmpdir()}/FakeFolder/fake.txt`;
      const fileRename = new FileRename(fakeTextFile);
      const response = await fileRename.fsRename();
      expect(response).toMatchObject({ error: 'Provided file is not an idml file' });
    });
  });
}

function FileRenameClassInitializerTest() {
  const fileRename = new FileRename('./example');
  describe('FileRename class Initialization', () => {
    it('should be able to call new() on FileRename', () => {
      expect(fileRename).toBeTruthy();
    });
    it('rename method should have been called once', async () => {
      const renameMockMethod = jest
        .spyOn(fileRename, 'fsRename')
        .mockImplementation(async (): FileRenameResults => ({ message: SUCCESS_MSG }));
      try {
        await fileRename.fsRename();
      } catch {
        // ignore errors
      } finally {
        expect(renameMockMethod).toHaveBeenCalledTimes(1);
      }
    });
  });
}
